package com.banca.service;

import com.banca.dao.UsuarioDAO;
import com.banca.dto.LoginRequest;
import com.banca.dto.LoginResponse;
import com.banca.model.Usuario;
import com.banca.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UsuarioDAO usuarioDAO;
    private final JwtUtil jwtUtil;

    public AuthService(UsuarioDAO usuarioDAO, JwtUtil jwtUtil) {
        this.usuarioDAO = usuarioDAO;
        this.jwtUtil = jwtUtil;
    }

    public sealed interface LoginResult permits LoginResult.Exitoso, LoginResult.Fallido {
        record Exitoso(LoginResponse response) implements LoginResult {}
        record Fallido(String mensaje) implements LoginResult {}
    }

    @Transactional
    public LoginResult login(LoginRequest req) {
        if (req.username() == null || req.username().isBlank())
            return new LoginResult.Fallido("El usuario es requerido.");
        if (req.password() == null || req.password().isBlank())
            return new LoginResult.Fallido("La contraseña es requerida.");

        String username = req.username().trim();
        Usuario usuario = usuarioDAO.findByUsername(username);

        if (usuario == null) {
            logger.warn("Login fallido - usuario no existe: {}", username);
            return new LoginResult.Fallido("Usuario o contraseña incorrectos.");
        }

        if (!req.password().equals(usuario.getPassword())) {
            usuarioDAO.incrementarIntentosFallidos(username);
            logger.warn("Login fallido - contraseña incorrecta: {}", username);
            return new LoginResult.Fallido("Usuario o contraseña incorrectos.");
        }

        usuarioDAO.resetearIntentosFallidos(username);
        usuarioDAO.updateUltimoAcceso(usuario.getId());

        String token = jwtUtil.generateToken(usuario.getId(), usuario.getUsername(), usuario.getRol());
        logger.info("Login exitoso: {}", username);

        return new LoginResult.Exitoso(new LoginResponse(
                token,
                usuario.getId(),
                usuario.getUsername(),
                usuario.getNombres(),
                usuario.getApellidos(),
                usuario.getRol()
        ));
    }
}
