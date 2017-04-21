import { NgDemoLib1Page } from './app.po';

describe('ng-demo-lib App', () => {
  let page: NgDemoLib1Page;

  beforeEach(() => {
    page = new NgDemoLib1Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('demo works!');
  });
});
