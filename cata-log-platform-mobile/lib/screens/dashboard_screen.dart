import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../theme/app_colors.dart';
import '../providers/auth_provider.dart';
import '../providers/chat_provider.dart';
import '../providers/artesao_provider.dart';
import '../core/api/api_client.dart';
import 'tabs/vitrine_tab.dart';
import 'tabs/encomendas_tab.dart';
import 'tabs/financeiro_tab.dart';
import 'nova_obra_screen.dart';
import 'login_screen.dart';
import 'integracoes_screen.dart';
import 'perfil_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;
  final _scaffoldKey = GlobalKey<ScaffoldState>();

  final _vitrineKey = GlobalKey<State>();

  List<Widget> get _tabs => [
        VitrineTab(key: _vitrineKey),
        const EncomendasTab(),
        const FinanceiroTab(),
      ];

  @override
  void initState() {
    super.initState();
    // Conectar chat e carregar perfil após o login
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _conectarChat();
      _carregarPerfil();
    });
  }

  void _carregarPerfil() {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.isAuthenticated) {
      Provider.of<ArtesaoProvider>(context, listen: false).carregarPerfil();
    }
  }

  void _conectarChat() {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final chat = Provider.of<ChatProvider>(context, listen: false);
    if (auth.isAuthenticated && !chat.isConnected && auth.user != null) {
      chat.conectarChat(
        userId: auth.user!.id,
        userName: auth.user!.nome,
      );
    }
  }

  void _abrirNovaObra() async {
    final result = await Navigator.of(context).push<bool>(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) =>
            const NovaObraScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0, 1),
              end: Offset.zero,
            ).animate(CurvedAnimation(
              parent: animation,
              curve: Curves.easeOutCubic,
            )),
            child: child,
          );
        },
        transitionDuration: const Duration(milliseconds: 400),
      ),
    );

    if (result == true && mounted) {
      setState(() {
        _currentIndex = 0;
      });
    }
  }

  void _handleLogout() async {
    final chatProvider = Provider.of<ChatProvider>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    // Desconectar chat antes do logout
    await chatProvider.desconectarChat();
    await authProvider.logout();

    if (!mounted) return;

    Navigator.of(context).pushAndRemoveUntil(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) =>
            const LoginScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(
            opacity: CurvedAnimation(
              parent: animation,
              curve: Curves.easeInOut,
            ),
            child: child,
          );
        },
        transitionDuration: const Duration(milliseconds: 400),
      ),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      endDrawer: _buildEndDrawer(),
      body: Stack(
        children: [
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: _tabs[_currentIndex],
          ),
          Positioned(
            top: MediaQuery.of(context).padding.top + 16,
            right: 24,
            child: GestureDetector(
              onTap: () => _scaffoldKey.currentState?.openEndDrawer(),
              child: Container(
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: AppColors.primary.withValues(alpha: 0.25),
                    width: 2.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.onSurface.withValues(alpha: 0.08),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Consumer<ArtesaoProvider>(
                  builder: (context, artesaoProvider, _) {
                    return _buildAvatar(artesaoProvider, 20);
                  },
                ),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          gradient: AppColors.primaryGradient,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.35),
              blurRadius: 20,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: FloatingActionButton(
          onPressed: _abrirNovaObra,
          backgroundColor: Colors.transparent,
          elevation: 0,
          highlightElevation: 0,
          shape: const CircleBorder(),
          child: const Icon(
            Icons.add_rounded,
            color: AppColors.onPrimary,
            size: 28,
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerLowest,
          boxShadow: [
            BoxShadow(
              color: AppColors.onSurface.withValues(alpha: 0.04),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: BottomNavigationBar(
              currentIndex: _currentIndex,
              onTap: (i) => setState(() => _currentIndex = i),
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.storefront_outlined),
                  activeIcon: Icon(Icons.storefront_rounded),
                  label: 'Minha Vitrine',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.assignment_outlined),
                  activeIcon: Icon(Icons.assignment_rounded),
                  label: 'Encomendas',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.payments_outlined),
                  activeIcon: Icon(Icons.payments_rounded),
                  label: 'Financeiro',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }


  Widget _buildEndDrawer() {
    return Drawer(
      width: MediaQuery.of(context).size.width * 0.78,
      backgroundColor: AppColors.inverseSurface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.horizontal(left: Radius.circular(20)),
      ),
      child: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 32, 24, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: AppColors.primaryContainer.withValues(alpha: 0.5),
                        width: 3,
                      ),
                    ),
                    child: Consumer<ArtesaoProvider>(
                      builder: (context, artesaoProvider, _) {
                        return _buildAvatar(artesaoProvider, 36);
                      },
                    ),
                  ),
                  const SizedBox(height: 16),
                  Consumer<ArtesaoProvider>(
                    builder: (context, artesaoProvider, _) {
                      final nome = artesaoProvider.perfil?.nomeAtelie
                          ?? Provider.of<AuthProvider>(context, listen: false).user?.nome
                          ?? 'Artesão';
                      final role = Provider.of<AuthProvider>(context, listen: false).user?.role ?? '';
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            nome,
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                              color: AppColors.inverseOnSurface,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            role,
                            style: GoogleFonts.manrope(
                              fontSize: 13,
                              color: AppColors.inverseOnSurface.withValues(alpha: 0.6),
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Container(
                height: 1,
                color: AppColors.inverseOnSurface.withValues(alpha: 0.1),
              ),
            ),

            const SizedBox(height: 8),

            _DrawerMenuItem(
              icon: Icons.storefront_outlined,
              label: 'Editar Perfil do Ateliê',
              onTap: () {
                Navigator.pop(context);
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => const PerfilScreen(),
                  ),
                );
              },
            ),
            _DrawerMenuItem(
              icon: Icons.link_rounded,
              label: 'Integrações',
              subtitle: 'Mercado Pago',
              onTap: () {
                Navigator.pop(context);
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => const IntegracoesScreen(),
                  ),
                );
              },
            ),

            const Spacer(),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Container(
                height: 1,
                color: AppColors.inverseOnSurface.withValues(alpha: 0.1),
              ),
            ),

            _DrawerMenuItem(
              icon: Icons.logout_rounded,
              label: 'Sair',
              isDestructive: true,
              onTap: () {
                Navigator.pop(context);
                _handleLogout();
              },
            ),

            const SizedBox(height: 16),

            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Text(
                'Cata Log v1.0.0',
                style: GoogleFonts.manrope(
                  fontSize: 11,
                  color: AppColors.inverseOnSurface.withValues(alpha: 0.3),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatar(ArtesaoProvider provider, double radius) {
    final perfil = provider.perfil;
    final hasFoto = perfil?.fotoUrl != null && perfil!.fotoUrl!.isNotEmpty;
    final inicial = (perfil?.nomeAtelie ?? 'A').substring(0, 1).toUpperCase();

    if (hasFoto) {
      final base = kIsWeb
          ? 'http://localhost:8080'
          : ApiClient.serverBaseUrl.replaceAll('/api/v1', '');
      return CircleAvatar(
        radius: radius,
        backgroundColor: AppColors.surfaceContainerHigh,
        backgroundImage: NetworkImage('$base${perfil.fotoUrl}'),
      );
    }

    return CircleAvatar(
      radius: radius,
      backgroundColor: AppColors.primary,
      child: Text(
        inicial,
        style: GoogleFonts.plusJakartaSans(
          fontSize: radius * 0.9,
          fontWeight: FontWeight.w700,
          color: AppColors.onPrimary,
        ),
      ),
    );
  }
}


class _DrawerMenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? subtitle;
  final VoidCallback onTap;
  final bool isDestructive;

  const _DrawerMenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.subtitle,
    this.isDestructive = false,
  });

  @override
  Widget build(BuildContext context) {
    final Color textColor = isDestructive
        ? AppColors.errorContainer
        : AppColors.inverseOnSurface;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        splashColor: AppColors.primaryContainer.withValues(alpha: 0.1),
        highlightColor: AppColors.primaryContainer.withValues(alpha: 0.05),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          child: Row(
            children: [
              Icon(
                icon,
                size: 22,
                color: textColor.withValues(alpha: 0.85),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: GoogleFonts.manrope(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: textColor,
                      ),
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        subtitle!,
                        style: GoogleFonts.manrope(
                          fontSize: 12,
                          color: textColor.withValues(alpha: 0.5),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              Icon(
                Icons.chevron_right_rounded,
                size: 20,
                color: textColor.withValues(alpha: 0.3),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
