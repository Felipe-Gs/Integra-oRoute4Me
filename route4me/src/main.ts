import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module'; // Importando o módulo que contém o AppComponent

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch((err) => console.error(err));
