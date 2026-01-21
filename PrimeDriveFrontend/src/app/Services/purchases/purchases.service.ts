import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Purchases } from '../../Models/purchases/purchases.interface';

/**
 * Service for handling purchase-related operations via HTTP.
 * Provides methods for creating, retrieving, and deleting purchases using the backend API.
 *
 * Author: Fatlum Epiroti
 * Version: 1.0
 * Date: 2025-06-06
 */
@Injectable({
  providedIn: 'root',
})
export class PurchasesService {
  private apiUrl = '/api/purchases';
  private httpClient = inject(HttpClient);

  /**
   * Creates a new purchase.
   * @param purchase - The purchase object containing buyerId, sellerId, and vehicleId.
   * @returns Observable of the created Purchases.
   */
  public createPurchase(purchase: Purchases): Observable<Purchases> {
    return this.httpClient.post<Purchases>(this.apiUrl, purchase, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves all purchases (admin only).
   * @returns Observable array of Purchases.
   */
  public getAllPurchases(): Observable<Purchases[]> {
    return this.httpClient.get<Purchases[]>(this.apiUrl, {
      withCredentials: true,
    });
  }

  /**
   * Retrieves a purchase by its ID (admin only).
   * @param id - The purchase ID.
   * @returns Observable of Purchases.
   */
  public getPurchaseById(id: string): Observable<Purchases> {
    return this.httpClient.get<Purchases>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  /**
   * Deletes a purchase by its ID (admin only).
   * @param id - The purchase ID to delete.
   * @returns Observable indicating completion.
   */
  public deletePurchase(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
