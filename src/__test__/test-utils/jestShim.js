/**
 * This file is required for jest to work with '@wojtekmaj/enzyme-adapter-react-18'
 * module.
 */
import {
  TextDecoder, TextEncoder,
} from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
