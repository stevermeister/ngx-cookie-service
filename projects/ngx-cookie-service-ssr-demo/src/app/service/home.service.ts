import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../model/user';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/app.constants';

@Injectable({
	providedIn: 'root',
})
export class HomeService {
	constructor(private httpClient: HttpClient) {}

	getUserInfo(): Observable<User> {
		return this.httpClient.get<User>(`${API_BASE_URL}/home`);
	}
}
