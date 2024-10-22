import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class StateService {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    loading = this.loadingSubject.asObservable();
    private routeSubject = new BehaviorSubject<string | ''>('');
    currentRoute = this.routeSubject.asObservable();

    LoadingOn(){
      this.loadingSubject.next(true);
    }
    LoadingOff(){
      this.loadingSubject.next(false);
    }
    setRoute(route  = ''){
      this.routeSubject.next(route);
    }

    time:number = Date.now();
    success = true;
    toastTitle  = 'Place Holder Title';
    toastContent = 'Place Holder Content';


    // Toast(success:boolean, title:string, content:string){
    //   this.success = success;
    //   this.toastTitle = title;
    //   this.toastContent = content;
    //   this.time = Date.now();

    //   new (window as any).bootstrap.Toast(document.getElementById('Toast')!).show();
    // }

    Toast(success:boolean, title:string, content:string){
      this.success = success;
      this.toastTitle = title;
      this.toastContent = content;
      const time = new Date();


      const toastContainer = document.getElementById('toast-container');

      // Create a toast element
      const toast = document.createElement('div');
      toast.className = this.success?'toast show text-bg-success':'toast show text-bg-danger';
      toast.innerHTML = `
          <div class="toast-header">
            <span class="rounded me-2" style="width: 10px;height: 10px;"></span>
            <strong class="me-auto">${this.toastTitle}</strong>
            <small>${time.toLocaleTimeString('en-GB',{ hour: '2-digit', minute: '2-digit', hour12: false })}</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body text-light" *ngIf="state.toastContent != ''">
            ${this.toastContent}
          </div>
      `;
      if (!toastContainer) {
        console.error('Toast container not found!');
        return; // Exit the function if the container is not found
      }
      // Append the toast to the container
      toastContainer.appendChild(toast);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (window as any).bootstrap.Toast(toast, { delay: 5000 }).show();

      toast.addEventListener('hidden.bs.toast', function () {
        toast.remove();
      });
    }
}
