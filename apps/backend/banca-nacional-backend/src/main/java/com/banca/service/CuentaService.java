package com.banca.service;

import com.banca.dao.CuentaDAO;
import com.banca.model.Cuenta;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CuentaService {

    private static final Logger logger = LoggerFactory.getLogger(CuentaService.class);

    private final CuentaDAO cuentaDAO;

    public CuentaService(CuentaDAO cuentaDAO) {
        this.cuentaDAO = cuentaDAO;
    }

    public List<Cuenta> obtenerCuentasUsuario(Long usuarioId) {
        return cuentaDAO.findByUsuario(usuarioId);
    }

    public List<Cuenta> obtenerCuentasUsuarioPorTipo(Long usuarioId, String tipoCuenta) {
        return cuentaDAO.findByUsuarioAndTipo(usuarioId, tipoCuenta);
    }

    public Cuenta obtenerCuentaPorNumero(String numeroCuenta) {
        return cuentaDAO.findByNumeroCuenta(numeroCuenta);
    }
}
