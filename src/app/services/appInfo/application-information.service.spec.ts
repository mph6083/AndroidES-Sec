import { TestBed } from '@angular/core/testing';

import { ApplicationInformationService } from './application-information.service';

describe('ApplicationInformationService', () => {
  let service: ApplicationInformationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationInformationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
