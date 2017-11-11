module.exports = {
    flatten: function flatten() {
        let rc = [];
        for (let itm of Array.from(arguments)) {
            if (itm instanceof Array) {
                let rc2 = flatten(...itm);
                rc.push(...rc2);
                continue;
            }
            rc.push(itm);
        }
        return rc;
    }
};
