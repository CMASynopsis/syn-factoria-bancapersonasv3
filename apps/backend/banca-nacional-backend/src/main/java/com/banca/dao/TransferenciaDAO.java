package com.banca.dao;

import com.banca.model.Transferencia;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.List;

@Repository
public class TransferenciaDAO {

    private static final Logger logger = LoggerFactory.getLogger(TransferenciaDAO.class);

    private final JdbcTemplate jdbc;

    public TransferenciaDAO(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Long insertar(Transferencia t) {
        String sql = """
                INSERT INTO transferencia
                (numero_operacion, tipo_transferencia, cuenta_origen_id, cuenta_origen_numero,
                 cuenta_destino_id, cuenta_destino_numero, cuenta_destino_cci, banco_destino,
                 titular_destino, monto, moneda, glosa, estado, usuario_id,
                 fecha_operacion, fecha_valor)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())
                """;

        var keyHolder = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, t.getNumeroOperacion());
            ps.setString(2, t.getTipoTransferencia());
            ps.setLong(3, t.getCuentaOrigenId());
            ps.setString(4, t.getCuentaOrigenNumero());
            if (t.getCuentaDestinoId() != null) ps.setLong(5, t.getCuentaDestinoId());
            else ps.setNull(5, Types.BIGINT);
            ps.setString(6, t.getCuentaDestinoNumero());
            ps.setString(7, t.getCuentaDestinoCci());
            ps.setString(8, t.getBancoDestino());
            ps.setString(9, t.getTitularDestino());
            ps.setBigDecimal(10, t.getMonto());
            ps.setString(11, t.getMoneda());
            ps.setString(12, t.getGlosa());
            ps.setString(13, t.getEstado());
            ps.setLong(14, t.getUsuarioId());
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key != null) {
            t.setId(key.longValue());
            return key.longValue();
        }
        return null;
    }

    public List<Transferencia> findByUsuario(Long usuarioId) {
        String sql = """
                SELECT id, numero_operacion, tipo_transferencia,
                       cuenta_origen_id, cuenta_origen_numero, cuenta_destino_id,
                       cuenta_destino_numero, cuenta_destino_cci, banco_destino,
                       titular_destino, monto, moneda, glosa, estado, motivo_rechazo,
                       fecha_operacion, fecha_valor, usuario_id
                FROM transferencia
                WHERE usuario_id = ?
                ORDER BY fecha_operacion DESC
                LIMIT 20
                """;
        return jdbc.query(sql, this::map, usuarioId);
    }

    private Transferencia map(ResultSet rs, int rowNum) throws SQLException {
        var t = new Transferencia();
        t.setId(rs.getLong("id"));
        t.setNumeroOperacion(rs.getString("numero_operacion"));
        t.setTipoTransferencia(rs.getString("tipo_transferencia"));
        t.setCuentaOrigenId(rs.getLong("cuenta_origen_id"));
        t.setCuentaOrigenNumero(rs.getString("cuenta_origen_numero"));
        long cdi = rs.getLong("cuenta_destino_id");
        if (!rs.wasNull()) t.setCuentaDestinoId(cdi);
        t.setCuentaDestinoNumero(rs.getString("cuenta_destino_numero"));
        t.setCuentaDestinoCci(rs.getString("cuenta_destino_cci"));
        t.setBancoDestino(rs.getString("banco_destino"));
        t.setTitularDestino(rs.getString("titular_destino"));
        t.setMonto(rs.getBigDecimal("monto"));
        t.setMoneda(rs.getString("moneda"));
        t.setGlosa(rs.getString("glosa"));
        t.setEstado(rs.getString("estado"));
        t.setMotivoRechazo(rs.getString("motivo_rechazo"));
        t.setUsuarioId(rs.getLong("usuario_id"));
        Timestamp fo = rs.getTimestamp("fecha_operacion");
        if (fo != null) t.setFechaOperacion(fo.toLocalDateTime());
        Timestamp fv = rs.getTimestamp("fecha_valor");
        if (fv != null) t.setFechaValor(fv.toLocalDateTime());
        return t;
    }
}
