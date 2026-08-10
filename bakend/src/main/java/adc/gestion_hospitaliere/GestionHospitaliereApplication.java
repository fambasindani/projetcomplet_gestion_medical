package adc.gestion_hospitaliere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GestionHospitaliereApplication {

	public static void main(String[] args) {
		SpringApplication.run(GestionHospitaliereApplication.class, args);
	}

}
