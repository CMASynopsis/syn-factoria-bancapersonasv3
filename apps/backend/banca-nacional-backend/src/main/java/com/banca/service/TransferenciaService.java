package com.banca.service;

import com.banca.dao.CuentaDAO;
import com.banca.dao.TransferenciaDAO;
import com.banca.model.Cuenta;
import com.banca.model.Transferencia;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class TransferenciaService {

    private static final Logger logger = LoggerFactory.getLogger(TransferenciaService.class);

    private final CuentaDAO cuentaDAO;
    private final TransferenciaDAO transferenciaDAO;

    public TransferenciaService(CuentaDAO cuentaDAO, TransferenciaDAO transferenciaDAO) {
        this.cuentaDAO = cuentaDAO;
        this.transferenciaDAO = transferenciaDAO;
    }

    public sealed interface TransResult permits TransResult.Ok, TransResult.Error {
        record Ok(String numeroOperacion) implements TransResult {}
        record Error(String mensaje) implements TransResult {}
    }

    @Transactional
    public TransResult transferirPropia(Long usuarioId, Long cuentaOrigenId,
                                        Long cuentaDestinoId, BigDecimal monto, String glosa) {
        if (cuentaOrigenId.equals(cuentaDestinoId))
            return new TransResult.Error("Origen y destino no pueden ser la misma cuenta.");
        if (monto == null || monto.compareTo(BigDecimal.ZERO) <= 0)
            return new TransResult.Error("El monto debe ser mayor a cero.");

        Cuenta origen  = cuentaDAO.findById(cuentaOrigenId);
        Cuenta destino = cuentaDAO.findById(cuentaDestinoId);

        if (origen == null || !origen.getUsuarioId().equals(usuarioId))
            return new TransResult.Error("Cuenta origen no válida.");
        if (destino == null || !destino.getUsuarioId().equals(usuarioId))
            return new TransResult.Error("Cuenta destino no válida.");
        if (!origen.getMoneda().equals(destino.getMoneda()))
            return new TransResult.Error("Las cuentas deben ser de la misma moneda.");
        if (origen.getSaldoDisponible().compareTo(monto) < 0)
            return new TransResult.Error("Saldo insuficiente en cuenta origen.");

        cuentaDAO.actualizarSaldo(origen.getId(),
                origen.getSaldo().subtract(monto), origen.getSaldoDisponible().subtract(monto));
        cuentaDAO.actualizarSaldo(destino.getId(),
                destino.getSaldo().add(monto), destino.getSaldoDisponible().add(monto));

        String nroOp = generarNroOp();
        Transferencia t = buildBase(nroOp, "PROPIA", origen, monto, usuarioId, glosa);
        t.setCuentaDestinoId(destino.getId());
        t.setCuentaDestinoNumero(destino.getNumeroCuenta());
        t.setTitularDestino(destino.getUsuarioNombre());
        transferenciaDAO.insertar(t);

        logger.info("Transferencia PROPIA OK. Op: {}", nroOp);
        return new TransResult.Ok(nroOp);
    }

    @Transactional
    public TransResult transferirMismoBanco(Long usuarioId, Long cuentaOrigenId,
                                             String numeroCuentaDestino, BigDecimal monto, String glosa) {
        if (monto == null || monto.compareTo(BigDecimal.ZERO) <= 0)
            return new TransResult.Error("El monto debe ser mayor a cero.");
        if (numeroCuentaDestino == null || numeroCuentaDestino.isBlank())
            return new TransResult.Error("Número de cuenta destino requerido.");

        Cuenta origen  = cuentaDAO.findById(cuentaOrigenId);
        Cuenta destino = cuentaDAO.findByNumeroCuenta(numeroCuentaDestino.trim());

        if (origen == null || !origen.getUsuarioId().equals(usuarioId))
            return new TransResult.Error("Cuenta origen no válida.");
        if (origen.getNumeroCuenta().equals(numeroCuentaDestino.trim()))
            return new TransResult.Error("No puede transferir a la misma cuenta.");
        if (destino == null)
            return new TransResult.Error("Cuenta destino no encontrada en Banco Nacional.");
        if (origen.getSaldoDisponible().compareTo(monto) < 0)
            return new TransResult.Error("Saldo insuficiente.");

        cuentaDAO.actualizarSaldo(origen.getId(),
                origen.getSaldo().subtract(monto), origen.getSaldoDisponible().subtract(monto));
        cuentaDAO.actualizarSaldo(destino.getId(),
                destino.getSaldo().add(monto), destino.getSaldoDisponible().add(monto));

        String nroOp = generarNroOp();
        Transferencia t = buildBase(nroOp, "MISMO_BANCO", origen, monto, usuarioId, glosa);
        t.setCuentaDestinoId(destino.getId());
        t.setCuentaDestinoNumero(destino.getNumeroCuenta());
        t.setTitularDestino(destino.getUsuarioNombre());
        t.setBancoDestino("Banco Nacional");
        transferenciaDAO.insertar(t);

        logger.info("Transferencia MISMO_BANCO OK. Op: {}", nroOp);
        return new TransResult.Ok(nroOp);
    }

    @Transactional
    public TransResult transferirOtroBanco(Long usuarioId, Long cuentaOrigenId,
                                            String cciDestino, String titularDestino,
                                            String bancoDestino, BigDecimal monto, String glosa) {
        if (monto == null || monto.compareTo(BigDecimal.ZERO) <= 0)
            return new TransResult.Error("El monto debe ser mayor a cero.");
        if (cciDestino == null || cciDestino.trim().length() != 20)
            return new TransResult.Error("El CCI debe tener exactamente 20 dígitos.");
        if (titularDestino == null || titularDestino.isBlank())
            return new TransResult.Error("El nombre del titular destino es requerido.");
        if (monto.compareTo(new BigDecimal("50000")) > 0)
            return new TransResult.Error("Monto supera el límite de S/ 50,000 para transferencias interbancarias.");

        Cuenta origen = cuentaDAO.findById(cuentaOrigenId);

        if (origen == null || !origen.getUsuarioId().equals(usuarioId))
            return new TransResult.Error("Cuenta origen no válida.");
        if (origen.getSaldoDisponible().compareTo(monto) < 0)
            return new TransResult.Error("Saldo insuficiente.");

        cuentaDAO.actualizarSaldo(origen.getId(),
                origen.getSaldo().subtract(monto), origen.getSaldoDisponible().subtract(monto));

        String nroOp = generarNroOp();
        Transferencia t = buildBase(nroOp, "OTRO_BANCO", origen, monto, usuarioId, glosa);
        t.setCuentaDestinoCci(cciDestino.trim());
        t.setTitularDestino(titularDestino.trim());
        t.setBancoDestino(bancoDestino.trim());
        transferenciaDAO.insertar(t);

        logger.info("Transferencia OTRO_BANCO OK. Op: {}", nroOp);
        return new TransResult.Ok(nroOp);
    }

    public List<Transferencia> obtenerTransferenciasUsuario(Long usuarioId) {
        return transferenciaDAO.findByUsuario(usuarioId);
    }

    private Transferencia buildBase(String nroOp, String tipo, Cuenta origen,
                                     BigDecimal monto, Long usuarioId, String glosa) {
        var t = new Transferencia();
        t.setNumeroOperacion(nroOp);
        t.setTipoTransferencia(tipo);
        t.setCuentaOrigenId(origen.getId());
        t.setCuentaOrigenNumero(origen.getNumeroCuenta());
        t.setMonto(monto);
        t.setMoneda(origen.getMoneda());
        t.setGlosa(glosa != null && !glosa.isBlank() ? glosa.trim() : tipo);
        t.setEstado("PROCESADA");
        t.setUsuarioId(usuarioId);
        return t;
    }

    private String generarNroOp() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }
}
