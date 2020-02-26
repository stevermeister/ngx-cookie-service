import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";

import { AppComponent } from "./app.component";
import { CookieService, CookieModule } from "../../lib";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule, HttpModule, CookieModule.forRoot()],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule {}
