package com.sohrabProjects.staynest.security;

import com.sohrabProjects.staynest.Exception.ResourceNotFoundException;
import com.sohrabProjects.staynest.dto.LoginDto;
import com.sohrabProjects.staynest.dto.SignUpRequestDto;
import com.sohrabProjects.staynest.dto.UserDto;
import com.sohrabProjects.staynest.entity.User;
import com.sohrabProjects.staynest.entity.enums.Role;
import com.sohrabProjects.staynest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {


    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTService jwtService;

    public UserDto signUp(SignUpRequestDto signUpRequestDto){
        User user=userRepository.findByEmail(signUpRequestDto.getEmail()).orElse(null);
        if(user !=null){
            throw new RuntimeException("User is already present with same email id");
        }
        User newUser=modelMapper.map(signUpRequestDto,User.class);
        newUser.setRoles(Set.of(Role.GUEST));
        newUser.setPassword(passwordEncoder.encode(signUpRequestDto.getPassword()));
        newUser = userRepository.save(newUser);
        return modelMapper.map(newUser, UserDto.class);

    }
    public String[] login(LoginDto loginDto){
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginDto.getEmail(), loginDto.getPassword()
        ));
       User user= (User)authentication.getPrincipal();
       String[] arr=new String[2];
       arr[0]=jwtService.generateAccessToken(user);
       arr[1]=jwtService.generateRefreshToken(user);
       return arr;
    }
    public String refreshToken(String refreshToken){
        Long id=jwtService.getUserIdFromToken(refreshToken);

        User user=userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not ofund with id:"+id));
        return jwtService.generateAccessToken(user);
    }
}
