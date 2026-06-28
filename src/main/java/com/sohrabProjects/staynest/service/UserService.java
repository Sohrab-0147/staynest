package com.sohrabProjects.staynest.service;


import com.sohrabProjects.staynest.dto.ProfileUpdateRequestDto;
import com.sohrabProjects.staynest.dto.UserDto;
import com.sohrabProjects.staynest.entity.User;

public interface UserService {

    User getUserById(Long id);

    void updateProfile(ProfileUpdateRequestDto profileUpdateRequestDto);

    UserDto getMyProfile();
}
