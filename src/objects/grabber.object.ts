import Holder from './holder.object';

class Grabber extends Holder {
    private readonly maxInteractionDistance: number;

    constructor(maxInteractionDistance = Infinity) {
        super();
        this.maxInteractionDistance = maxInteractionDistance;
    }

    interactClosest(holders: Holder[]) {
        if (this.locked) return;
        let closesHolder: Holder | undefined;
        let currentClosestDistance = Infinity;
        for (const holder of holders) {
            if (this === holder) continue;
            const distance = this.position.distanceTo(holder.position);
            if (distance < this.maxInteractionDistance && distance < currentClosestDistance && !holder.getLock()) {
                currentClosestDistance = distance;
                closesHolder = holder;
            }
        }

        if (closesHolder) this.interact(closesHolder);
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
