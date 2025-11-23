package hcmute.hackathon.vibecoders.repository;

import hcmute.hackathon.vibecoders.entity.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IUserRepository extends JpaRepository<UserModel, Long> {
    Optional<UserModel> findByUsername(String username);
    UserModel getUserByEmail(String email);
}
