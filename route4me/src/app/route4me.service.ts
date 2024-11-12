import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Route4MeService {

  private apiKey = 'C4834690694B370B1D5CC97B1FBFA2A6';
  private baseUrl = 'https://api.route4me.com/api.v4/optimization_problem.php';

  private apiUrlPedido = 'http://localhost:3000/order';
  private apiUrlGeocoder = 'http://localhost:3000/geocoder'
  private apiUrlRoute = 'http://localhost:3000/optimization_problem'
  //private apiUrl = 'https://api.route4me.com/api.v4/order.php?api_key=C4834690694B370B1D5CC97B1FBFA2A6'; Pedindo por esse URL da erro no CORS

  constructor(private http: HttpClient) { }

  createOrder(orderData: any): Observable<any> {
    return this.http.post(this.apiUrlPedido, orderData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  geocodeAddress(address: string): Observable<any> {
    return this.http.post(this.apiUrlGeocoder, { address }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  createRoute (orderData: any): Observable<any> {
    return this.http.post(this.apiUrlRoute, orderData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    })
  }
}
