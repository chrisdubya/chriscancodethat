import * as THREE from "three";

import EventEmitter from "../../utils/EventEmitter";
import { passiveEvent } from "../../utils/event.utils";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default class InteractiveControls extends EventEmitter {
  camera: THREE.Camera;
  el: HTMLElement | Window;

  plane: THREE.Plane;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  offset: THREE.Vector3;
  intersection: THREE.Vector3;

  objects: THREE.Object3D[];
  hovered: THREE.Object3D | null;
  selected: THREE.Object3D | null;

  isDown: boolean;
  isTouch: boolean;
  rect!: Rect;
  intersectionData: THREE.Intersection | null = null;

  private _enabled = false;

  private handlerDown!: (e: MouseEvent | TouchEvent) => void;
  private handlerMove!: (e: MouseEvent | TouchEvent) => void;
  private handlerUp!: (e: MouseEvent | TouchEvent) => void;
  private handlerLeave!: (e: MouseEvent | TouchEvent) => void;

  get enabled() {
    return this._enabled;
  }

  constructor(camera: THREE.Camera, el?: HTMLElement) {
    super();

    this.camera = camera;
    this.el = el || window;

    this.plane = new THREE.Plane();
    this.raycaster = new THREE.Raycaster();

    this.mouse = new THREE.Vector2();
    this.offset = new THREE.Vector3();
    this.intersection = new THREE.Vector3();

    this.objects = [];
    this.hovered = null;
    this.selected = null;

    this.isDown = false;

    // Replaces browser-detect: coarse pointer == touch device.
    this.isTouch = window.matchMedia("(pointer: coarse)").matches;

    this.resize();
    this.enable();
  }

  enable() {
    if (this.enabled) return;
    this.addListeners();
    this._enabled = true;
  }

  disable() {
    if (!this.enabled) return;
    this.removeListeners();
    this._enabled = false;
  }

  addListeners() {
    this.handlerDown = this.onDown.bind(this);
    this.handlerMove = this.onMove.bind(this);
    this.handlerUp = this.onUp.bind(this);
    this.handlerLeave = this.onLeave.bind(this);

    if (this.isTouch) {
      this.el.addEventListener("touchstart", this.handlerDown as EventListener, passiveEvent);
      this.el.addEventListener("touchmove", this.handlerMove as EventListener, passiveEvent);
      this.el.addEventListener("touchend", this.handlerUp as EventListener, passiveEvent);
    } else {
      this.el.addEventListener("mousedown", this.handlerDown as EventListener);
      this.el.addEventListener("mousemove", this.handlerMove as EventListener);
      this.el.addEventListener("mouseup", this.handlerUp as EventListener);
      this.el.addEventListener("mouseleave", this.handlerLeave as EventListener);
    }
  }

  removeListeners() {
    if (this.isTouch) {
      this.el.removeEventListener("touchstart", this.handlerDown as EventListener);
      this.el.removeEventListener("touchmove", this.handlerMove as EventListener);
      this.el.removeEventListener("touchend", this.handlerUp as EventListener);
    } else {
      this.el.removeEventListener("mousedown", this.handlerDown as EventListener);
      this.el.removeEventListener("mousemove", this.handlerMove as EventListener);
      this.el.removeEventListener("mouseup", this.handlerUp as EventListener);
      this.el.removeEventListener("mouseleave", this.handlerLeave as EventListener);
    }
  }

  resize(x?: number, y?: number, width?: number, height?: number) {
    if (x || y || width || height) {
      this.rect = { x: x!, y: y!, width: width!, height: height! };
    } else if (this.el === window) {
      this.rect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
    } else {
      this.rect = (this.el as HTMLElement).getBoundingClientRect();
    }
  }

  onMove(e: MouseEvent | TouchEvent) {
    const t = "touches" in e ? e.touches[0] : e;
    const touch = { x: t.clientX, y: t.clientY };

    this.mouse.x = ((touch.x + this.rect.x) / this.rect.width) * 2 - 1;
    this.mouse.y = -((touch.y + this.rect.y) / this.rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // is dragging
    if (this.selected && this.isDown) {
      if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
        this.emit("interactive-drag", {
          object: this.selected,
          position: this.intersection.sub(this.offset),
        });
      }
      return;
    }

    const intersects = this.raycaster.intersectObjects(this.objects);

    if (intersects.length > 0) {
      const object = intersects[0].object;
      this.intersectionData = intersects[0];

      this.plane.setFromNormalAndCoplanarPoint(
        this.camera.getWorldDirection(this.plane.normal),
        object.position
      );

      if (this.hovered !== object) {
        this.emit("interactive-out", { object: this.hovered });
        this.emit("interactive-over", { object });
        this.hovered = object;
      } else {
        this.emit("interactive-move", { object, intersectionData: this.intersectionData });
      }
    } else {
      this.intersectionData = null;

      if (this.hovered !== null) {
        this.emit("interactive-out", { object: this.hovered });
        this.hovered = null;
      }
    }
  }

  onDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.onMove(e);

    this.emit("interactive-down", {
      object: this.hovered,
      previous: this.selected,
      intersectionData: this.intersectionData,
    });
    this.selected = this.hovered;

    if (this.selected) {
      if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
        this.offset.copy(this.intersection).sub(this.selected.position);
      }
    }
  }

  onUp(_e: MouseEvent | TouchEvent) {
    this.isDown = false;
    this.emit("interactive-up", { object: this.hovered });
  }

  onLeave(e: MouseEvent | TouchEvent) {
    this.onUp(e);

    this.emit("interactive-out", { object: this.hovered });
    this.hovered = null;
  }
}
