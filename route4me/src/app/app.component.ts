import { Component } from '@angular/core';
import { Route4MeService } from './route4me.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Route4Me Integration';

  optimizationProblemId: string = '';
  orderId: string = '';

  originAddress = {
    address: '',
    number: '',
    city: '',
    state: '',
    //postal_code: '',
    country: '',
    //latitude: null,
    //longitude: null
  };

  destinationAddress = {
    address: '',
    number: '',
    city: '',
    state: '',
    //postal_code: '',
    country: '',
    //latitude: null,
    //longitude: null
  };

  contactInfos = {
    first_name: '',
    second_name: '',
    email: '',
    phone: '',
  };

  loadInfos = {
    pieces: '',
  };

  timesInfos = {
    first_window_time_start: '',
    first_window_time_end: '',
    second_windows_time_start: '',
    second_windows_time_end: '',
  };

  routeAddress: string = '';
  latitude: number | null = null;
  longitude: number | null = null;

  routeInfos = {
    route_name: '',
    route_time: '',
    route_date: '',
    optimize: 'Distance', // ou time
  };

  addresses: {
    address: string;
    lat: number | null;
    lng: number | null;
    is_depot: boolean;
  }[] = [];

  constructor(private route4MeService: Route4MeService) {}

  createOrder() {
    const address_1 = `${this.originAddress.address}, ${
      this.originAddress.number || ''
    }, ${this.originAddress.city}, ${this.originAddress.state}, ${
      this.originAddress.country
    }`;
    const address_2 = `${this.destinationAddress.address}, ${
      this.destinationAddress.number || ''
    }, ${this.destinationAddress.city}, ${this.destinationAddress.state}, ${
      this.destinationAddress.country
    }`;

    const EXT_FIELD_first_name = `${this.contactInfos.first_name}`;
    const EXT_FIELD_last_name = `${this.contactInfos.second_name}`;
    const EXT_FIELD_email = `${this.contactInfos.email}`;
    const EXT_FIELD_phone = `${this.contactInfos.phone}`;

    const EXT_FIELD_pieces = `${this.loadInfos.pieces}`;

    const local_time_window_start = this.formatTime(
      this.timesInfos.first_window_time_start
    );
    const local_time_window_end = this.formatTime(
      this.timesInfos.first_window_time_end
    );
    const local_time_window_start_2 = this.formatTime(
      this.timesInfos.second_windows_time_start
    );
    const local_time_window_end_2 = this.formatTime(
      this.timesInfos.second_windows_time_end
    );

    const orderData = {
      address_1: address_1,
      address_2: address_2,

      EXT_FIELD_first_name: EXT_FIELD_first_name,
      EXT_FIELD_last_name: EXT_FIELD_last_name,
      EXT_FIELD_email: EXT_FIELD_email,
      EXT_FIELD_phone: EXT_FIELD_phone,

      EXT_FIELD_pieces: EXT_FIELD_pieces,

      local_time_window_start: this.formatTime(
        this.timesInfos.first_window_time_start
      ),
      local_time_window_end: this.formatTime(
        this.timesInfos.first_window_time_end
      ),
      local_time_window_start_2: this.formatTime(
        this.timesInfos.second_windows_time_start
      ),
      local_time_window_end_2: this.formatTime(
        this.timesInfos.second_windows_time_end
      ),
    };

    console.log('Dados do pedido:', orderData);

    this.route4MeService.createOrder(orderData).subscribe(
      (response) => {
        console.log('Pedido criado com sucesso:', response);
        alert('Pedido criado com sucesso!');
      },
      (error) => {
        console.error('Erro ao criar pedido:', error);
        alert('Erro ao criar pedido. Verifique os dados e tente novamente.');
      }
    );
  }

  // adicionar pedido a rota
  addOrderToRoute() {
    const optimizationProblemId = this.optimizationProblemId;
    const orderId = this.orderId;
    const data = {
      optimization_problem_id: optimizationProblemId,
      order_id: orderId,
    };
    this.route4MeService.addOrderToRoute(data).subscribe(
      (response) => {
        console.log('Pedido adicionado à rota:', response);
        alert('Pedido adicionado à rota com sucesso!');
      },
      (error) => {
        console.error('Erro ao adicionar pedido à rota:', error);
        alert(
          'Erro ao adicionar pedido à rota. Verifique os dados e tente novamente.'
        );
      }
    );
  }

  formatTime(time: string): string {
    if (!time) return '';
    const timeParts = time.split(':');
    if (timeParts.length === 1) {
      return `${timeParts[0]}:00`;
    }
    return time;
  }

  finderLatitudeLongitude() {
    this.route4MeService.geocodeAddress(this.routeAddress).subscribe(
      (response) => {
        if (response && response[0]) {
          this.latitude = response[0].lat;
          this.longitude = response[0].lng;
          console.log(
            `Latitude: ${this.latitude}, Longitude: ${this.longitude}`
          );
        } else {
          console.error('Geocoding API não retornou dados de localização');
        }
      },
      (error) => {
        console.error('Erro ao geocodificar endereço:', error);
      }
    );
  }

  addAddress() {
    if (
      this.routeAddress &&
      this.latitude !== null &&
      this.longitude !== null
    ) {
      this.addresses.push({
        address: this.routeAddress,
        lat: this.latitude,
        lng: this.longitude,
        is_depot: this.addresses.length === 0,
      });

      console.log(
        'Endereço adicionado:',
        this.routeAddress,
        this.latitude,
        this.longitude
      );

      this.routeAddress = '';
      this.latitude = null;
      this.longitude = null;
    } else {
      console.error('Preencha o endereço e geocodifique antes de adicionar.');
    }
  }

  createRoute() {
    const routeData = {
      route_name: this.routeInfos.route_name,
      optimize: this.routeInfos.optimize.toLowerCase(),
      addresses: this.addresses.map((address, index) => {
        const isDeparture = address.is_depot;

        if (isDeparture && this.routeInfos.route_time) {
          console.log(
            `Saída as ${this.routeInfos.route_time} do endereço: ${address.address}`
          );
        }

        return {
          address: address.address,
          lat: address.lat,
          lng: address.lng,
          is_depot: address.is_depot,
          route_time: isDeparture ? this.routeInfos.route_time : '',
          route_date: isDeparture ? this.routeInfos.route_date : '',
        };
      }),
    };

    this.route4MeService.createRoute(routeData).subscribe(
      (response) => {
        console.log('Rota criada com sucesso:', response);

        if (response && response.optimization_problem_id) {
          const optimizationProblemId = response.optimization_problem_id;
          alert(
            `Rota criada com sucesso! ID da Rota: ${optimizationProblemId}`
          );
        } else {
          console.error('Resposta sem optimization_problem_id');
        }
      },
      (error) => {
        console.error('Erro ao criar rota:', error);
      }
    );
  }
}
