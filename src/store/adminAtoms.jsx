import { atom } from 'recoil';

const navIndex = atom({
    key: 'navindex',
    default: 0
})

const totalTrees = atom({
    key: 'totaltree',
    default: {},
});

const totalTreeTypes = atom({
    key: 'totaltreetypes',
    default: {},
});

const uniqueUsers = atom({
    key: 'uniqueusers',
    default: {},
});

const totalPlots = atom({
    key: 'totalplots',
    default: {},
});

const treeByPlots = atom({
    key: 'treebyplots',
    default: {}
})

export {
    navIndex,
    totalTrees,
    totalTreeTypes,
    uniqueUsers,
    totalPlots,
    treeByPlots
}