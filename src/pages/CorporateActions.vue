<template>
    <div class="corporate-actions-page">

        <!-- ================= HEADER ================= -->
        <div class="page-header">
            <h4>Corporate Actions</h4>

            <div class="action-buttons">
                <el-button size="small" @click="showDividend = true">Dividend</el-button>
                <el-button size="small" @click="showBonus = true">Bonus</el-button>
                <el-button size="small" @click="showSplit = true">Split</el-button>
                <el-button size="small" @click="showDemerger = true">Demerger</el-button>
                <el-button size="small" @click="showRights = true">Rights</el-button>
            </div>
        </div>

        <!-- ================= DESKTOP TABLE ================= -->
        <el-table v-if="!isMobile" :data="actions" border stripe>
            <el-table-column prop="time" label="Time" width="180" />
            <el-table-column prop="type" label="Action" width="140" />
            <el-table-column prop="symbol" label="Symbol" width="160" />
            <el-table-column prop="description" label="Description" />
        </el-table>

        <!-- ================= MOBILE COMPACT CARDS ================= -->
        <div v-else class="mobile-actions">
            <el-card v-for="(a, i) in actions" :key="i" shadow="never" class="action-card">
                <div class="card-header">
                    <span class="card-symbol">{{ a.symbol }}</span>
                    <el-tag size="small" effect="plain">{{ a.type }}</el-tag>
                </div>

                <div class="card-desc">{{ a.description }}</div>
                <div class="card-time">{{ a.time }}</div>
            </el-card>
        </div>

        <!-- ================= DIVIDEND ================= -->
        <el-dialog v-model="showDividend" title="Dividend" :fullscreen="isMobile" width="420px">
            <StockSelect v-model="dividend.symbol" />
            <el-date-picker v-model="dividend.exDate" type="date" class="w-100 mt" />
            <el-input v-model.number="dividend.dividendPerShare" placeholder="Dividend / Share" class="mt" />

            <template #footer>
                <el-button @click="showDividend = false">Cancel</el-button>
                <el-button type="primary" @click="submitDividend">Apply</el-button>
            </template>
        </el-dialog>

        <!-- ================= BONUS ================= -->
        <el-dialog v-model="showBonus" title="Bonus Issue" :fullscreen="isMobile" width="420px">
            <StockSelect v-model="bonus.symbol" />
            <el-input v-model="bonus.ratio" placeholder="Ratio (1:1)" class="mt" />

            <template #footer>
                <el-button @click="showBonus = false">Cancel</el-button>
                <el-button type="primary" @click="submitBonus">Apply</el-button>
            </template>
        </el-dialog>

        <!-- ================= SPLIT ================= -->
        <el-dialog v-model="showSplit" title="Stock Split" :fullscreen="isMobile" width="420px">
            <StockSelect v-model="split.symbol" />
            <el-input-number v-model="split.from" placeholder="From" class="w-100 mt" />
            <el-input-number v-model="split.to" placeholder="To" class="w-100 mt" />

            <template #footer>
                <el-button @click="showSplit = false">Cancel</el-button>
                <el-button type="primary" @click="submitSplit">Apply</el-button>
            </template>
        </el-dialog>

        <!-- ================= DEMERGER ================= -->
        <el-dialog v-model="showDemerger" title="Demerger" :fullscreen="isMobile" width="650px">
            <label class="label">Parent Company</label>
            <StockSelect v-model="demerger.parentSymbol" />

            <el-checkbox v-model="demerger.parentContinues" class="mt">
                Parent continues trading
            </el-checkbox>

            <el-divider />

            <h4>Resulting Companies</h4>

            <div v-for="(child, index) in demerger.children" :key="index" class="child-row">
                <StockSelect v-model="child.symbol" />
                <el-input v-model="child.ratio" placeholder="Ratio" />
                <el-input-number v-model="child.costPercent" placeholder="Cost %" />
                <el-button text type="danger" @click="removeChild(index)">
                    Remove
                </el-button>
            </div>

            <el-button text type="primary" @click="addChild">
                + Add Company
            </el-button>

            <template #footer>
                <el-button @click="showDemerger = false">Cancel</el-button>
                <el-button type="primary" @click="submitDemerger">Apply</el-button>
            </template>
        </el-dialog>

        <!-- ================= RIGHTS ================= -->
        <el-dialog v-model="showRights" title="Rights Issue" :fullscreen="isMobile" width="460px">
            <StockSelect v-model="rights.symbol" />
            <el-input v-model="rights.ratio" placeholder="Ratio" class="mt" />
            <el-input-number v-model="rights.appliedShares" placeholder="Applied Shares" class="mt w-100" />
            <el-input-number v-model="rights.price" placeholder="Price" class="mt w-100" />

            <template #footer>
                <el-button @click="showRights = false">Cancel</el-button>
                <el-button type="primary" @click="submitRights">Apply</el-button>
            </template>
        </el-dialog>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import StockSelect from "../components/StockSelect.vue";

import {
    applyDividend,
    applyBonus,
    applySplit,
    applyDemerger,
    applyRights,
    getCorporateActions
} from "../api/corporateActions";

/* ================= RESPONSIVE ================= */
const width = ref(window.innerWidth);
const isMobile = computed(() => width.value < 768);

const onResize = () => {
    width.value = window.innerWidth;
};

/* ================= DIALOG STATES ================= */
const showDividend = ref(false);
const showBonus = ref(false);
const showSplit = ref(false);
const showDemerger = ref(false);
const showRights = ref(false);

/* ================= TABLE / CARD DATA ================= */
const actions = ref([]);

const loadCorporateActions = async () => {
    const { data } = await getCorporateActions();
    actions.value = data.map(a => ({
        time: new Date(a.createdAt).toLocaleString(),
        type: a.actionType,
        symbol: a.symbol,
        description: buildDescription(a)
    }));
};

const buildDescription = a => {
    switch (a.actionType) {
        case "DIVIDEND":
            return `₹${a.details.dividendPerShare} per share`;
        case "BONUS":
            return `Bonus ${a.details.ratio}`;
        case "SPLIT":
            return `Split ${a.details.from}:${a.details.to}`;
        case "DEMERGER":
            return `${a.details.children?.length || 0} resulting companies`;
        case "RIGHTS":
            return `Rights ${a.details.ratio} @ ₹${a.details.price}`;
        default:
            return "-";
    }
};

/* ================= FORMS ================= */
const dividend = ref({ symbol: "", exDate: "", dividendPerShare: 0 });
const bonus = ref({ symbol: "", ratio: "" });
const split = ref({ symbol: "", from: null, to: null });

const demerger = ref({
    parentSymbol: "",
    parentContinues: true,
    children: [{ symbol: "", ratio: "1:1", costPercent: 30 }]
});

const rights = ref({ symbol: "", ratio: "", appliedShares: 0, price: 0 });

/* ================= HELPERS ================= */
const addChild = () => {
    demerger.value.children.push({ symbol: "", ratio: "1:1", costPercent: 0 });
};

const removeChild = i => {
    demerger.value.children.splice(i, 1);
};

/* ================= SUBMITS ================= */
const submitDividend = async () => {
    await applyDividend({
        symbol: dividend.value.symbol,
        exDate: dividend.value.exDate,
        dividendPerShare: dividend.value.dividendPerShare,
        kind: "INTERIM"
    });
    showDividend.value = false;
    await loadCorporateActions();
};

const submitBonus = async () => {
    await applyBonus(bonus.value);
    showBonus.value = false;
    await loadCorporateActions();
};

const submitSplit = async () => {
    await applySplit(split.value);
    showSplit.value = false;
    await loadCorporateActions();
};

const submitDemerger = async () => {
    await applyDemerger(demerger.value);
    showDemerger.value = false;
    await loadCorporateActions();
};

const submitRights = async () => {
    await applyRights(rights.value);
    showRights.value = false;
    await loadCorporateActions();
};

/* ================= LIFECYCLE ================= */
onMounted(() => {
    loadCorporateActions();
    window.addEventListener("resize", onResize);
});

onUnmounted(() => {
    window.removeEventListener("resize", onResize);
});
</script>

<style scoped>
.corporate-actions-page {
    padding: 8px;
}

/* HEADER */
.page-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
}

/* ACTION BUTTONS */
.action-buttons {
    display: flex;
    gap: 6px;
    overflow-x: auto;
}

/* MOBILE LIST */
.mobile-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* SMALL CARD */
.action-card {
    padding: 4px 0px;
    border-radius: 6px;
    background: #fff;
}

/* CARD HEADER */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
}

/* SYMBOL */
.card-symbol {
    font-size: 13px;
    font-weight: 600;
}

/* DESCRIPTION */
.card-desc {
    font-size: 12px;
    line-height: 1.3;
    margin-bottom: 2px;
}

/* TIME */
.card-time {
    font-size: 11px;
    color: #999;
}

/* DEMERGER CHILD */
.child-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr auto;
    gap: 6px;
    margin-bottom: 8px;
}

/* UTILS */
.mt {
    margin-top: 8px;
}

.w-100 {
    width: 100%;
}

.label {
    font-weight: 600;
    margin-bottom: 4px;
}
</style>
