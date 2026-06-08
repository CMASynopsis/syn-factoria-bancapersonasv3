package com.banca.controller;

import com.banca.dto.ApiResponse;
import com.banca.dto.LoginRequest;
import com.banca.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@Valid @RequestBody LoginRequest req) {
        return switch (authService.login(req)) {
            case AuthService.LoginResult.Exitoso(var response) ->
                    ResponseEntity.ok(ApiResponse.ok("Bienvenido.", response));
            case AuthService.LoginResult.Fallido(var mensaje) ->
                    ResponseEntity.status(401).body(ApiResponse.error(mensaje));
        };
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.ok("Sesión cerrada.", null));
    }
}
