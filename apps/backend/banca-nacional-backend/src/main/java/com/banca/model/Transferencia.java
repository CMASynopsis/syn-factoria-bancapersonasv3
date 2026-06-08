package com.banca.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Transferencia {

    private Long id;
    private String numeroOperacion;
    private String tipoTransferencia;
    private Long cuentaOrigenId;
    private String cuentaOrigenNumero;
    private Long cuentaDestinoId;
    private String cuentaDestinoNumero;
    private String cuentaDestinoCci;
    private String bancoDestino;
    private String titularDestino;
    private BigDecimal monto;
    private String moneda;
    private String glosa;
    private String estado;
    private String motivoRechazo;
    private LocalDateTime fechaOperacion;
    private LocalDateTime fechaValor;
    private Long usuarioId;

    public Transferencia() {}

    public String getTipoTransferenciaDescripcion() {
        if (tipoTransferencia == null) return "";
        return switch (tipoTransferencia) {
            case "PROPIA"      -> "Entre mis cuentas";
            case "MISMO_BANCO" -> "Mismo banco";
            case "OTRO_BANCO"  -> "Otro banco (CCI)";
            default            -> tipoTransferencia;
        };
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumeroOperacion() { return numeroOperacion; }
    public void setNumeroOperacion(String n) { this.numeroOperacion = n; }
    public String getTipoTransferencia() { return tipoTransferencia; }
    public void setTipoTransferencia(String t) { this.tipoTransferencia = t; }
    public Long getCuentaOrigenId() { return cuentaOrigenId; }
    public void setCuentaOrigenId(Long c) { this.cuentaOrigenId = c; }
    public String getCuentaOrigenNumero() { return cuentaOrigenNumero; }
    public void setCuentaOrigenNumero(String c) { this.cuentaOrigenNumero = c; }
    public Long getCuentaDestinoId() { return cuentaDestinoId; }
    public void setCuentaDestinoId(Long c) { this.cuentaDestinoId = c; }
    public String getCuentaDestinoNumero() { return cuentaDestinoNumero; }
    public void setCuentaDestinoNumero(String c) { this.cuentaDestinoNumero = c; }
    public String getCuentaDestinoCci() { return cuentaDestinoCci; }
    public void setCuentaDestinoCci(String c) { this.cuentaDestinoCci = c; }
    public String getBancoDestino() { return bancoDestino; }
    public void setBancoDestino(String b) { this.bancoDestino = b; }
    public String getTitularDestino() { return titularDestino; }
    public void setTitularDestino(String t) { this.titularDestino = t; }
    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal m) { this.monto = m; }
    public String getMoneda() { return moneda; }
    public void setMoneda(String m) { this.moneda = m; }
    public String getGlosa() { return glosa; }
    public void setGlosa(String g) { this.glosa = g; }
    public String getEstado() { return estado; }
    public void setEstado(String e) { this.estado = e; }
    public String getMotivoRechazo() { return motivoRechazo; }
    public void setMotivoRechazo(String m) { this.motivoRechazo = m; }
    public LocalDateTime getFechaOperacion() { return fechaOperacion; }
    public void setFechaOperacion(LocalDateTime d) { this.fechaOperacion = d; }
    public LocalDateTime getFechaValor() { return fechaValor; }
    public void setFechaValor(LocalDateTime d) { this.fechaValor = d; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long u) { this.usuarioId = u; }
}
