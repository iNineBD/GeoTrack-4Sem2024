<template>
    <v-card class="mx-auto" width="100%" style="box-shadow: none; border-radius: 0; margin-bottom: 25px;">
        <v-col style="padding: 20px 20px 0 20px;">
            <!-- Users combobox -->
            <v-combobox v-model="selectedUsers" :items="users" label="Usuário" item-title="name"
                prepend-icon="mdi-filter-variant" chips clearable multiple>
                <!-- Slot para customizar a exibição dos chips -->
                <template v-slot:selection="{ attrs, item, select, selected }">
                    <v-chip v-bind="attrs" :model-value="selected" closable @click="select" @click:close="remove(item)">
                        <strong>{{ item.name }}</strong>&nbsp;<span>({{ item.deviceName }})</span>
                        <!-- Exibe o nome do dispositivo -->
                    </v-chip>
                </template>
            </v-combobox>

            <!-- Card das áreas geográficas -->
            <v-card-actions class="d-flex justify-space-between">
                <v-row class="d-flex align-center no-gutters">
                    <v-col cols="100%" style="padding: 0px;">
                        <!-- Combobox de áreas geográficas -->
                        <v-combobox :disabled="disabledTexts" label="Áreas geográficas" color="primary"
                            v-model="selectedGeoArea" :items="geoAreas" item-value="id" item-title="name"></v-combobox>
                    </v-col>

                    <v-col cols="auto" style="padding: 0px 0px 20px 10px;">
                        <div class="icon-container">
                            <v-btn icon @click="drawCircle" class="no-shadow rounded">
                                <v-icon>mdi-circle-outline</v-icon>
                                <v-icon class="plus-icon">mdi-plus</v-icon>
                            </v-btn>
                        </div>
                    </v-col>
                </v-row>
            </v-card-actions>

            <!-- Date selection -->
            <v-date-input v-model="date" label="Selecione o período" multiple="range" color="primary" :max="today"
                :locale="locale" :format="customDateFormat" placeholder="dd/MM/yyyy"></v-date-input>

            <!-- Quick date filters using chips -->
            <v-col style="padding: 0px; display: flex;">
                <v-chip style="margin: 0px 2px !important;" size="small" v-for="(filter, index) in quickFilters"
                    :key="filter.label" @click="setQuickFilter(filter.range, index)"
                    :color="selectedQuickFilter === index ? 'primary' : 'primary_light'"
                    :active="selectedQuickFilter === index" filter class="ma-2" variant="flat">
                    {{ filter.label }}
                </v-chip>
            </v-col>
        </v-col>

        <v-card-actions class="d-flex justify-space-between" style="padding: 20px 20px 0 20px;">
            <v-row class="d-flex" no-gutters>
                <v-col cols="8">
                    <v-btn :disabled="ButtonDisabled || loading" :loading="loading" class="text-none" color="primary"
                        size="large" variant="flat" block rounded="lg" @click="handleConsult">
                        Consultar
                    </v-btn>
                </v-col>
                <v-col cols="4">
                    <v-btn :disabled="loading" :loading="loading" class="text-none" color="primary_light" size="large"
                        variant="flat" block rounded="lg" @click="clearFields">
                        Limpar
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-actions>

    </v-card>
</template>

<script>
export default {
    data: () => ({
        today: new Date().toISOString().substr(0, 10),
        loading: false,
        date: null,
        users: [], // Lista de usuários
        selectedUsers: [], // Armazena múltiplos usuários selecionados
        devices: [],
        locale: 'pt',
        customDateFormat: 'dd/MM/yyyy',
        quickFilters: [
            { label: "Hoje", range: [new Date(), new Date()] },
            { label: "Últimos 3 dias", range: [new Date(Date.now() - 3 * 864e5), new Date()] },
            { label: "Última semana", range: [new Date(Date.now() - 7 * 864e5), new Date()] },
            { label: "Último mês", range: [new Date(Date.now() - 30 * 864e5), new Date()] }
        ],
        selectedQuickFilter: null,
        dateInputDisabled: false,
        geoAreas: [],
        selectedGeoArea: null,
        open: ['geoAreas'],
    }),

    mounted() {
        this.fetchUsers();
        this.fetchGeoAreas();
    },

    computed: {
        ButtonDisabled() {
            return this.selectedUsers.length === 0 || !this.date;
        },
    },

    methods: {
        async fetchUsers() {
            try {
                const response = await fetch("http://localhost:8080/filters/users?page=0&qtdPage=1000");
                const data = await response.json();

                // Mapeando a resposta da API para o formato correto
                this.users = data.listUsers.map(user => ({
                    name: user.userName.toUpperCase(), // Nome do usuário
                    deviceId: user.idDevice, // ID do dispositivo associado
                }));

                console.log("Successfully fetched users:", this.users);
            } catch (error) {
                console.log("Error fetching users:", error);
            }
        },

        async handleConsult() {
            if (this.selectedUsers.length === 0 || !this.date) return;
            
            // Extraindo os IDs dos dispositivos dos usuários selecionados
            const deviceIds = this.selectedUsers.map(user => user.deviceId);

            // Preparando os dados da requisição com todos os devices como um array e as datas uma única vez
            const requestData = {
                devices: deviceIds[0],  // Array de IDs dos dispositivos
                startDate: new Date(this.date[0]).toLocaleDateString('en-CA'),  // Data de início
                finalDate: new Date(this.date[this.date.length - 1]).toLocaleDateString('en-CA') , // Data de fim
            };

            console.log("Dados enviados:", requestData);
            this.$emit('consult', requestData);  // Certifique-se de emitir o evento com os dados
        },

        async fetchGeoAreas() {
            try {
                const response = await fetch("http://localhost:8080/zone");
                const data = await response.json();
                this.geoAreas = data.map(area => ({
                    id: area.id,
                    name: area.name,
                }));
                console.log("Áreas geográficas carregadas:", data);
            } catch (error) {
                console.log("Erro ao buscar áreas geográficas:", error);
            }
        },

        clearFields() {
            window.location.reload();
        },

        drawCircle() {
            this.$emit('drawCircle'); // Emite o evento para habilitar o desenho do círculo
        },

        setQuickFilter(range, index) {
            if (this.selectedQuickFilter === index) {
                this.selectedQuickFilter = null;
                this.date = null;
                this.dateInputDisabled = false;
            } else {
                this.selectedQuickFilter = index;
                this.date = range.map(date => date.toISOString().substr(0, 10));
                this.dateInputDisabled = true;
            }
        },

        remove(item) {
            this.selectedUsers = this.selectedUsers.filter(user => user.id !== item.id);
        }
    },

    watch: {
        selectedUsers(newValue) {
            if (newValue.length > 5) {
                this.selectedUsers = newValue.slice(0, 5); // Mantém apenas os 3 primeiros usuários
            }
            console.log(this.selectedUsers)
        },
        loading(val) {
            if (!val) return;
            setTimeout(() => (this.loading = false), 1000);
        },
    },
};
</script>

<style scoped>
.icon-container {
    position: relative;
}

.plus-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
    color: black;
}

.title-text {
    font-weight: bold;
    font-size: 16px;
}

.no-shadow {
    box-shadow: none !important;
}

.rounded {
    border-radius: 0 !important;
}
</style>
