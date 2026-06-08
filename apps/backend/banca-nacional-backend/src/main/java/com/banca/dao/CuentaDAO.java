package com.banca.dao;

import com.banca.model.Cuenta;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.math.BigDecimal;
import java.util.List;

@Repository
public class CuentaDAO {

    private static final Logger logger = LoggerFactory.getLogger(CuentaDAO.class);

    private final JdbcTemplate jdbc;

    private static final String SELECT_BASE = """
            SELECT c.id, c.numero_cuenta, c.tipo_cuenta, c.moneda,
                   c.saldo, c.saldo_disponible, c.estado, c.usuario_id,
                   c.fecha_apertura, c.cci, u.nombres, u.apellidos
            FROM cuenta c
            INNER JOIN usuario u ON c.usuario_id = u.id
            """;

    public CuentaDAO(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Cuenta> findByUsuario(Long usuarioId) {
        String sql = SELECT_BASE + "WHERE c.usuario_id = ? AND c.estado = 'ACTIVA' ORDER BY c.tipo_cuenta, c.moneda";
        return jdbc.query(sql, this::map, usuarioId);
    }

    public List<Cuenta> findByUsuarioAndTipo(Long usuarioId, String tipoCuenta) {
        String sql = SELECT_BASE + "WHERE c.usuario_id = ? AND c.estado = 'ACTIVA' AND c.tipo_cuenta = ? ORDER BY c.moneda";
        return jdbc.query(sql, this::map, usuarioId, tipoCuenta);
    }

    public Cuenta findById(Long id) {
        var rows = jdbc.query(SELECT_BASE + "WHERE c.id = ?", this::map, id);
        return rows.isEmpty() ? null : rows.getFirst();
    }

    public Cuenta findByNumeroCuenta(String numeroCuenta) {
        String sql = SELECT_BASE + "WHERE c.numero_cuenta = ? AND c.estado = 'ACTIVA'";
        var rows = jdbc.query(sql, this::map, numeroCuenta);
        return rows.isEmpty() ? null : rows.getFirst();
    }

    public void actualizarSaldo(Long id, BigDecimal saldo, BigDecimal saldoDisponible) {
        jdbc.update("UPDATE cuenta SET saldo = ?, saldo_disponible = ? WHERE id = ?",
                saldo, saldoDisponible, id);
    }

    private Cuenta map(ResultSet rs, int rowNum) throws SQLException {
        var c = new Cuenta();
        c.setId(rs.getLong("id"));
        c.setNumeroCuenta(rs.getString("numero_cuenta"));
        c.setTipoCuenta(rs.getString("tipo_cuenta"));
        c.setMoneda(rs.getString("moneda"));
        c.setSaldo(rs.getBigDecimal("saldo"));
        c.setSaldoDisponible(rs.getBigDecimal("saldo_disponible"));
        c.setEstado(rs.getString("estado"));
        c.setUsuarioId(rs.getLong("usuario_id"));
        c.setCci(rs.getString("cci"));
        c.setUsuarioNombre(rs.getString("nombres") + " " + rs.getString("apellidos"));
        Timestamp fa = rs.getTimestamp("fecha_apertura");
        if (fa != null) c.setFechaApertura(fa.toLocalDateTime());
        return c;
    }
}
