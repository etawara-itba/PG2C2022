import * as THREE from 'three';

class Holder extends THREE.Object3D {
    protected locked = false;

    receive(gift: THREE.Object3D) {
        if (this.hasObject()) throw new Error('already has object');
        if (this.locked) throw new Error('holder is locked');
        this.add(gift);
        gift.position.set(0, 0, 0);
    }

    give(): THREE.Object3D {
        if (this.children.length <= 0) throw new Error('no object to give');
        if (this.locked) throw new Error('holder is locked');
        const gift: THREE.Object3D = this.children[0];
        this.clear();
        return gift;
    }

    hasObject(): boolean {
        return this.children.length > 0;
    }

    setLock(locked: boolean): void {
        this.locked = locked;
    }

    getLock(): boolean {
        return this.locked;
    }
}
export default Holder;
