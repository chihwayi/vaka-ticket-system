import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TicketListComponent } from './ticket-list/ticket-list.component';
import { TicketDetailComponent } from './ticket-detail/ticket-detail.component';
import { TicketFormComponent } from './ticket-form/ticket-form.component';
import { MyTicketsComponent } from './my-tickets/my-tickets.component';
import { AssignedTicketsComponent } from './assigned-tickets/assigned-tickets.component';
import { AuthGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  { 
    path: '', 
    component: TicketListComponent,
    canActivate: [AuthGuard] 
  },
  {
    path: 'new',
    component: TicketFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'my-tickets',
    component: MyTicketsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'assigned',
    component: AssignedTicketsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_SUPPORT'] },
  },
  {
    path: 'edit/:id',
    component: TicketFormComponent,
    canActivate: [AuthGuard],
  },
  { path: ':id', component: TicketDetailComponent }, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TicketsRoutingModule {}
