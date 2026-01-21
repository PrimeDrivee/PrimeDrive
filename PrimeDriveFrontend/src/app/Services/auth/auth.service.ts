import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginResponse } from '../../Models/auth/loginResponse.interface';

/**
 * Service for handling user authentication via HTTP.
 * Provides login, logout, and session-check functionality using the backend API.
 *
 * Author: Fatlum Epiroti
 * Version: 1.0.0
 * Date: 2025-06-03
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/api/authentication';
  private httpClient = inject(HttpClient);

  /**
   * Sends login credentials to the backend and returns a LoginResponse.
   * @param username - The user's username.
   * @param password - The user's password.
   * @returns Observable containing authentication response with token and userId.
   */
  public login(username: string, password: string): Observable<LoginResponse> {
    return this.httpClient.post<LoginResponse>(
      `${this.apiUrl}/login`,
      {
        username,
        password,
      },
      {
        withCredentials: true,
      }
    );
  }

  /**
   * Sends a logout request to the backend to invalidate the current session.
   * @returns Observable indicating completion.
   */
  public logout(): Observable<void> {
    return this.httpClient.post<void>(
      `${this.apiUrl}/logout`,
      {},
      {
        withCredentials: true,
      }
    );
  }

  /**
   * Sends a registration request to the backend with user details.
   * @param registerDto - An object containing user registration fields.
   * @returns Observable indicating completion or failure.
   */
  public register(registerDto: unknown): Observable<unknown> {
    return this.httpClient.post<unknown>(`${this.apiUrl}/register`, registerDto, {
      withCredentials: true,
    });
  }

  /**
   * Checks if the user is currently authenticated by verifying the session on the backend.
   * @returns Observable with a boolean indicating authentication status.
   */
  public isAuthenticated(): Observable<boolean> {
    return this.httpClient.get<boolean>(`${this.apiUrl}/check-session`, {
      withCredentials: true,
    });
  }
}
