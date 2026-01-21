import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../Models/vehicles/user.interface';

/**
 * Service for retrieving user-related data from the backend API.
 * Provides methods to fetch the currently authenticated user or any user by ID.
 *
 * Author: Fatlum Epiroti
 * Version: 1.0.0
 * Date: 2025-06-03
 */
@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = '/api/users';
  private httpClient = inject(HttpClient);

  /**
   * Fetches the currently authenticated user's information from the backend.
   * @returns Observable containing the User object.
   */
  public getCurrentUser(): Observable<User> {
    return this.httpClient.get<User>(`${this.apiUrl}/current`, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves a user's data by their unique ID.
   * @param id - The user's UUID.
   * @returns Observable containing the User object.
   */
  public getUserById(id: string): Observable<User> {
    return this.httpClient.get<User>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
