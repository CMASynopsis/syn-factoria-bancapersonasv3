package com.banca.controller;

import com.banca.dto.*;
import com.banca.model.Transferencia;
import com.banca.security.BancaPrincipal;
import com.banca.service.TransferenciaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transferencias")
public class TransferenciaController {

    private final TransferenciaService transferenciaService;

    public TransferenciaController(TransferenciaService transferenciaService) {
        this.transferenciaService = transferenciaService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Transferencia>>> historial(
            @AuthenticationPrincipal BancaPrincipal principal) {
        var lista = transferenciaService.obtenerTransferenciasUsuario(principal.userId());
        return ResponseEntity.ok(ApiResponse.ok("OK", lista));
    }

    @PostMapping("/propia")
    public ResponseEntity<ApiResponse<String>> propia(
            @AuthenticationPrincipal BancaPrincipal principal,
            @Valid @RequestBody TransferenciaPropiaRequest req) {
        return responder(transferenciaService.transferirPropia(
                principal.userId(), req.cuentaOrigenId(), req.cuentaDestinoId(),
                req.monto(), req.glosa()));
    }

    @PostMapping("/mismo-banco")
    public ResponseEntity<ApiResponse<String>> mismoBanco(
            @AuthenticationPrincipal BancaPrincipal principal,
            @Valid @RequestBody TransferenciaMismoBancoRequest req) {
        return responder(transferenciaService.transferirMismoBanco(
                principal.userId(), req.cuentaOrigenId(), req.numeroCuentaDestino(),
                req.monto(), req.glosa()));
    }

    @PostMapping("/otro-banco")
    public ResponseEntity<ApiResponse<String>> otroBanco(
            @AuthenticationPrincipal BancaPrincipal principal,
            @Valid @RequestBody TransferenciaOtroBancoRequest req) {
        return responder(transferenciaService.transferirOtroBanco(
                principal.userId(), req.cuentaOrigenId(), req.cciDestino(),
                req.titularDestino(), req.bancoDestino(), req.monto(), req.glosa()));
    }

    private ResponseEntity<ApiResponse<String>> responder(TransferenciaService.TransResult result) {
        return switch (result) {
            case TransferenciaService.TransResult.Ok(var nroOp) ->
                    ResponseEntity.ok(ApiResponse.ok("Transferencia realizada con éxito.", nroOp));
            case TransferenciaService.TransResult.Error(var msg) ->
                    ResponseEntity.badRequest().body(ApiResponse.error(msg));
        };
    }
}
