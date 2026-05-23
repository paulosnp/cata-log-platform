class FinanceiroResponse {
  final double faturamentoMes;
  final double faturamentoMesAnterior;
  final int totalVendasMes;
  final double saldoDisponivel;
  final double saldoEmEspera;
  final List<MovimentacaoResponse> movimentacoes;

  FinanceiroResponse({
    required this.faturamentoMes,
    required this.faturamentoMesAnterior,
    required this.totalVendasMes,
    required this.saldoDisponivel,
    required this.saldoEmEspera,
    required this.movimentacoes,
  });

  factory FinanceiroResponse.fromJson(Map<String, dynamic> json) {
    return FinanceiroResponse(
      faturamentoMes: (json['faturamentoMes'] as num?)?.toDouble() ?? 0,
      faturamentoMesAnterior:
          (json['faturamentoMesAnterior'] as num?)?.toDouble() ?? 0,
      totalVendasMes: json['totalVendasMes'] as int? ?? 0,
      saldoDisponivel:
          (json['saldoDisponivel'] as num?)?.toDouble() ?? 0,
      saldoEmEspera:
          (json['saldoEmEspera'] as num?)?.toDouble() ?? 0,
      movimentacoes: (json['movimentacoes'] as List<dynamic>?)
              ?.map((e) =>
                  MovimentacaoResponse.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  double? get variacao {
    if (faturamentoMesAnterior <= 0) return null;
    return ((faturamentoMes - faturamentoMesAnterior) /
            faturamentoMesAnterior) *
        100;
  }
}

class MovimentacaoResponse {
  final String tipo;
  final String descricao;
  final String detalhe;
  final double valor;
  final String data;

  MovimentacaoResponse({
    required this.tipo,
    required this.descricao,
    required this.detalhe,
    required this.valor,
    required this.data,
  });

  factory MovimentacaoResponse.fromJson(Map<String, dynamic> json) {
    return MovimentacaoResponse(
      tipo: json['tipo'] as String? ?? 'VENDA',
      descricao: json['descricao'] as String? ?? '',
      detalhe: json['detalhe'] as String? ?? '',
      valor: (json['valor'] as num?)?.toDouble() ?? 0,
      data: json['data'] as String? ?? '',
    );
  }

  bool get isIncoming => valor >= 0;
}
