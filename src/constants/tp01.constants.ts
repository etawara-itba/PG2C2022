// control related
export const KEY_CONTROLS_DOLLY_IN = 'KeyO';
export const KEY_CONTROLS_DOLLY_OUT = 'KeyP';

// ui related
export const SETTINGS_DEFAULT_SHAPE = 'A1';
export const SETTINGS_MIN_HEIGHT = 0.1;
export const SETTINGS_MAX_HEIGHT = 20;
export const SETTINGS_DEFAULT_HEIGHT = 20;
export const SETTINGS_DEFAULT_TWIST_ANGLE = 90;
export const SETTINGS_MIN_TWIST_ANGLE = 0;
export const SETTINGS_MAX_TWIST_ANGLE = 360;

// scene related
export const MAX_DELTA = 1.0 / 24;
export const GROUND_SIZE = 500;
export const SKY_RGB = '#C5C5C5';
export const GROUND_RGB = '#8B7675';

// printer related
export const PRINTER_X = -100;
export const PRINTER_Y = 0;
export const PRINTER_Z = 0;
export const PRINT_SPEED = 10;
export const PRINTED_OBJECT_MAX_HEIGHT = 20;

// camera related
export const CAMERA_FOV = 75;
export const CENTER_CAMERA_X = 0;
export const CENTER_CAMERA_Y = 80;
export const CENTER_CAMERA_Z = 200;
export const CENTER_CAMERA_CONTROLS_MIN_DOLLY = 100;
export const CENTER_CAMERA_CONTROLS_MAX_DOLLY = 500;
export const PRINTER_CAMERA_X = PRINTER_X;
export const PRINTER_CAMERA_Y = PRINTER_Y + 50;
export const PRINTER_CAMERA_Z = PRINTER_Z + 2 * PRINTED_OBJECT_MAX_HEIGHT;
export const PRINTER_CAMERA_CONTROLS_MIN_DOLLY = 50;
export const PRINTER_CAMERA_CONTROLS_MAX_DOLLY = 200;
