
import { ImagePipe } from './image.pipe';

describe('ImagePipe', () => {
    it('create an instance', () => {
        const pipe = new ImagePipe(null, null);
        expect(pipe).toBeTruthy();
  });
});
