// control related
export const KEY_CONTROLS_DOLLY_IN = 'KeyO';
export const KEY_CONTROLS_DOLLY_OUT = 'KeyP';
export const KEY_FORKLIFT_FORWARD = 'KeyW';
export const KEY_FORKLIFT_BACKWARDS = 'KeyS';
export const KEY_FORKLIFT_LEFT = 'KeyA';
export const KEY_FORKLIFT_RIGHT = 'KeyD';
export const KEY_FORKLIFT_LIFT_UP = 'KeyQ';
export const KEY_FORKLIFT_LIFT_DOWN = 'KeyE';
export const KEY_FORKLIFT_GRABBER = 'KeyG';

// ui related
export const SETTINGS_DEFAULT_SHAPE = 'A1';
export const SETTINGS_MIN_HEIGHT = 0.1;
export const SETTINGS_MAX_HEIGHT = 30;
export const SETTINGS_DEFAULT_HEIGHT = 20;
export const SETTINGS_DEFAULT_TWIST_ANGLE = 90;
export const SETTINGS_MIN_TWIST_ANGLE = 0;
export const SETTINGS_MAX_TWIST_ANGLE = 360;

// scene related
export const MAX_DELTA = 1.0 / 24;
export const ROOF_HEIGHT = 100;
export const ROOF_CP = 300;
export const GROUND_SIZE = 500;
export const SKY_RGB = '#EEEEEE';
export const GROUND_RGB = '#8B7675';
export const ROOF_RGB = '#C5C5C5';

// printer related
export const PRINTER_X = -100;
export const PRINTER_Y = 0;
export const PRINTER_Z = 0;
export const PRINTER_HAND_MOVEMENT_SPEED = 20;
export const PRINTER_PRINT_SLOWDOWN = 0.6;
export const PRINTED_OBJECT_MAX_HEIGHT = 30;

// forklift related
export const FORKLIFT_MOVEMENT_SPEED = 50;
export const FORKLIFT_ROTATION_SPEED = Math.PI / 2;
export const FORKLIFT_LIFT_SPEED = 15;
export const FORKLIFT_MAX_INTERACTION_DISTANCE = 25;
export const FORKLIFT_STARTING_X = 0;
export const FORKLIFT_STARTING_Y = 0;
export const FORKLIFT_STARTING_Z = 0;
export const FORKLIFT_SCALE_FACTOR = 2;

// shelf related
export const SHELF_X = 100;
export const SHELF_Y = 0;
export const SHELF_Z = 0;

// camera related
export const CAMERA_FOV = 75;
export const CAMERA_DEFAULT_NEAR = 0.1;
export const CAMERA_DEFAULT_FAR = 1200;
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
export const SHELF_CAMERA_X = SHELF_X;
export const SHELF_CAMERA_Y = SHELF_Y + 50;
export const SHELF_CAMERA_Z = SHELF_Z + 2 * PRINTED_OBJECT_MAX_HEIGHT;
export const SHELF_CAMERA_CONTROLS_MIN_DOLLY = 50;
export const SHELF_CAMERA_CONTROLS_MAX_DOLLY = 200;
