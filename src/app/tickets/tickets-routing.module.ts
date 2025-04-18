import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { TicketFormComponent } from './ticket-form/ticket-form.component';
import { MyTicketsComponent } from './my-tickets/my-tickets.component';
import { AssignedTicketsComponent } from './assigned-tickets/assigned-tickets.component';
import { AuthGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  { path: '', component: TicketListComponent },
  { path: 'new', component: TicketFormComponent },
  { path: 'edit/:id', component: TicketFormComponent },
  { path: ':id', component: TicketDetailComponent },
  { path: 'my-tickets', component: MyTicketsComponent },
  { 
    path: 'assigned', 
    component: AssignedTicketsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_SUPPORT'] }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketsRoutingModule { }
