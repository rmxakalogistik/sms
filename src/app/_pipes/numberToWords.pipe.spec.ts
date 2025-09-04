
import { NumberToWordsPipe } from './numberToWords.pipe';

describe('NumberToWordsPipe', () => {
    it('create an instance', () => {
        const pipe = new NumberToWordsPipe();
        expect(pipe).toBeTruthy();
  });
});
