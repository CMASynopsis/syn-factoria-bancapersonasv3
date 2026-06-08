package com.banca.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Cuenta {

    private Long id;
    private String numeroCuenta;
    private String tipoCuenta;
    private String moneda;
    private BigDecimal saldo;
    private BigDecimal saldoDisponible;
    private String estado;
    private Long usuarioId;
    private String usuarioNombre;
    private LocalDateTime fechaApertura;
    private String cci;

    public Cuenta() {}

    public String getNumeroCuentaFormateado() {
        if (numeroCuenta == null || numeroCuenta.length() < 13) return numeroCuenta;
        return numeroCuenta.substring(0, 3) + "-"
             + numeroCuenta.substring(3, 6) + "-"
             + numeroCuenta.substring(6, 9) + "-"
             + numeroCuenta.substring(9);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNumeroCuenta() { return numeroCuenta; }
    public void setNumeroCuenta(String numeroCuenta) { this.numeroCuenta = numeroCuenta; }
    public String getTipoCuenta() { return tipoCuenta; }
    public void setTipoCuenta(String tipoCuenta) { this.tipoCuenta = tipoCuenta; }
    public String getMoneda() { return moneda; }
    public void setMoneda(String moneda) { this.moneda = moneda; }
    public BigDecimal getSaldo() { return saldo; }
    public void setSaldo(BigDecimal saldo) { this.saldo = saldo; }
    public BigDecimal getSaldoDisponible() { return saldoDisponible; }
    public void setSaldoDisponible(BigDecimal saldoDisponible) { this.saldoDisponible = saldoDisponible; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public String getUsuarioNombre() { return usuarioNombre; }
    public void setUsuarioNombre(String usuarioNombre) { this.usuarioNombre = usuarioNombre; }
    public LocalDateTime getFechaApertura() { return fechaApertura; }
    public void setFechaApertura(LocalDateTime fechaApertura) { this.fechaApertura = fechaApertura; }
    public String getCci() { return cci; }
    public void setCci(String cci) { this.cci = cci; }
}
