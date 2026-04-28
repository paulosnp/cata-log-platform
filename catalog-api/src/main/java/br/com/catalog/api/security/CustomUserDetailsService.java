package br.com.catalog.api.security;

import br.com.catalog.api.model.Admin;
import br.com.catalog.api.model.Artesao;
import br.com.catalog.api.model.Comprador;
import br.com.catalog.api.repository.AdminRepository;
import br.com.catalog.api.repository.ArtesaoRepository;
import br.com.catalog.api.repository.CompradorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final CompradorRepository compradorRepository;
    private final ArtesaoRepository artesaoRepository;
    private final AdminRepository adminRepository;

    /**
     * Busca em cascata por probabilidade de acesso:
     * Comprador (maior volume) → Artesão → Admin (menor volume)
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        Optional<Comprador> comprador = compradorRepository.findByEmail(email);
        if (comprador.isPresent()) {
            Comprador c = comprador.get();
            return new User(c.getEmail(), c.getSenha(),
                    List.of(new SimpleGrantedAuthority("ROLE_COMPRADOR")));
        }

        Optional<Artesao> artesao = artesaoRepository.findByEmail(email);
        if (artesao.isPresent()) {
            Artesao a = artesao.get();
            return new User(a.getEmail(), a.getSenha(),
                    List.of(new SimpleGrantedAuthority("ROLE_ARTESAO")));
        }

        Optional<Admin> admin = adminRepository.findByEmail(email);
        if (admin.isPresent()) {
            Admin adm = admin.get();
            return new User(adm.getEmail(), adm.getSenha(),
                    List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        }

        throw new UsernameNotFoundException("Usuário não encontrado: " + email);
    }
}
