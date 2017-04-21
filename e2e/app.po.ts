import { browser, element, by } from 'protractor';

export class NgDemoLib1Page {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('demo-root h1')).getText();
  }
}
