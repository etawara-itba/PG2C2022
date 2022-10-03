import * as THREE from 'three';
import Holder from './holder.object';

class Grabber extends Holder {
    private readonly maxInteractionDistance: number;

    constructor(maxInteractionDistance = Infinity) {
        super();
        this.maxInteractionDistance = maxInteractionDistance;
    }

    interactClosest(holders: Holder[]) {
        if (this.locked) return;
        const myWorldPosition = this.getWorldPosition(new THREE.Vector3());
        let closestHolder: Holder | undefined;
        let currentClosestDistance = Infinity;
        for (const holder of holders) {
            if (this === holder) continue;
            const distance = myWorldPosition.distanceTo(holder.getWorldPosition(new THREE.Vector3()));
            if (distance < this.maxInteractionDistance && distance < currentClosestDistance && !holder.getLock()) {
                currentClosestDistance = distance;
                closestHolder = holder;
            }
        }

        if (closestHolder) this.interact(closestHolder);
    }

    interact(holder: Holder) {
        try {
            if (this.hasObject()) {
                holder.receive(this.give());
            } else {
                this.receive(holder.give());
            }
        } catch (err) {
            // error cases due to holder having or not having object
        }
    }
}
export default Grabber;
