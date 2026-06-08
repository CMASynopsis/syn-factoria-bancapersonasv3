package com.banca.controller;

import com.banca.dto.ApiResponse;
import com.banca.model.Cuenta;
import com.banca.security.BancaPrincipal;
import com.banca.service.CuentaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cuentas")
public class CuentaController {

    private final CuentaService cuentaService;

    public CuentaController(CuentaService cuentaService) {
        this.cuentaService = cuentaService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Cuenta>>> listar(
            @AuthenticationPrincipal BancaPrincipal principal,
            @RequestParam(required = false) String tipo) {

        List<Cuenta> cuentas = (tipo != null && !tipo.isBlank() && !tipo.equals("TODAS"))
                ? cuentaService.obtenerCuentasUsuarioPorTipo(principal.userId(), tipo)
                : cuentaService.obtenerCuentasUsuario(principal.userId());

        return ResponseEntity.ok(ApiResponse.ok("OK", cuentas));
    }
}
