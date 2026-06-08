package com.banca.dao;

import com.banca.model.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

@Repository
public class UsuarioDAO {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioDAO.class);

    private final JdbcTemplate jdbc;

    public UsuarioDAO(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Usuario findByUsername(String username) {
        String sql = """
                SELECT id, username, password, nombres, apellidos, email,
                       telefono, estado, rol, fecha_creacion, ultimo_acceso
                FROM usuario
                WHERE username = ? AND estado = 'ACTIVO'
                """;
        var rows = jdbc.query(sql, this::map, username);
        return rows.isEmpty() ? null : rows.getFirst();
    }

    public void updateUltimoAcceso(Long id) {
        jdbc.update("UPDATE usuario SET ultimo_acceso = NOW() WHERE id = ?", id);
    }

    public void incrementarIntentosFallidos(String username) {
        jdbc.update("UPDATE usuario SET intentos_fallidos = intentos_fallidos + 1 WHERE username = ?", username);
    }

    public void resetearIntentosFallidos(String username) {
        jdbc.update("UPDATE usuario SET intentos_fallidos = 0 WHERE username = ?", username);
    }

    private Usuario map(ResultSet rs, int rowNum) throws SQLException {
        var u = new Usuario();
        u.setId(rs.getLong("id"));
        u.setUsername(rs.getString("username"));
        u.setPassword(rs.getString("password"));
        u.setNombres(rs.getString("nombres"));
        u.setApellidos(rs.getString("apellidos"));
        u.setEmail(rs.getString("email"));
        u.setTelefono(rs.getString("telefono"));
        u.setEstado(rs.getString("estado"));
        u.setRol(rs.getString("rol"));
        Timestamp fc = rs.getTimestamp("fecha_creacion");
        if (fc != null) u.setFechaCreacion(fc.toLocalDateTime());
        Timestamp ua = rs.getTimestamp("ultimo_acceso");
        if (ua != null) u.setUltimoAcceso(ua.toLocalDateTime());
        return u;
    }
}
