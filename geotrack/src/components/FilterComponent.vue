<template>
  <div class="Filter">
    <h2>Pesquisa por nome</h2>
    <!-- Campo de busca para usuários -->
    <input 
      type="text" 
      v-model="searchUser" 
      placeholder="Buscar usuário..." 
      @focus="showUserList = true"
    />
    <!-- Lista de usuários, ocultada após a seleção -->
    <ul v-if="searchUser && filteredUsers.length > 0 && showUserList">
      <li v-for="user in filteredUsers" :key="user.id" @click="selectUser(user)">
        {{ user.name }}
      </li>
    </ul>

    <!-- Campo de busca para dispositivos, exibido após seleção de usuário -->
    <input  
      v-if="selectedUser"  
      type="text"  
      v-model="searchDevice"  
      placeholder="Buscar dispositivo..." 
      @focus="showDeviceList = true"  
    />
    <!-- Lista de dispositivos, ocultada após a seleção -->
    <ul v-if="selectedUser && searchDevice && filteredDevices.length > 0 && showDeviceList">
      <li v-for="device in filteredDevices" :key="device.idDevice" @click="selectDevice(device)">
        {{ device.name }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'filterComponent',
  data() {
    return {
      selectedUser: null,      // Armazena o usuário selecionado
      selectedDevice: null,    // Armazena o dispositivo selecionado
      searchUser: '',          // Termo de busca para usuários
      searchDevice: '',        // Termo de busca para dispositivos
      showUserList: false,     // Controla a exibição da lista de usuários
      showDeviceList: false,   // Controla a exibição da lista de dispositivos
      listUsers: [
        { id: 3144, name: 'DANIEL ANTONIO GONZALEZ TOCUYO' },
        { id: 1435, name: 'DARWIN YOEL FRANCO VASQUEZ' },
        { id: 4304, name: 'DOMINGOS LAZARO NUNES DE CARVALHO' },
        { id: 1515, name: 'DONIZETI CANHETE DA SILVA' },
        { id: 8573, name: 'ESTER DE FREITAS DE LIMA' }
        // ... outros usuários
      ],
      listDevices: [
        { idDevice: 30, name: 'CARD' }
        // ... outros dispositivos
      ]
    };
  },
  computed: {
    // Filtra os usuários com base no campo de busca
    filteredUsers() {
      return this.listUsers.filter(user => 
        user.name.toLowerCase().includes(this.searchUser.toLowerCase())
      );
    },
    // Filtra os dispositivos com base no campo de busca
    filteredDevices() {
      return this.listDevices.filter(device => 
        device.name.toLowerCase().includes(this.searchDevice.toLowerCase())
      );
    }
  },
  methods: {
    // Seleciona o usuário e armazena o nome no campo de busca
    selectUser(user) {
      this.selectedUser = user;
      this.searchUser = user.name; // Mantém o nome do usuário selecionado no campo de busca
      this.showUserList = false;   // Oculta a lista após a seleção
      this.clearSearchDevice();    // Limpa o campo de busca de dispositivo após seleção de novo usuário
    },
    // Seleciona o dispositivo e armazena o nome no campo de busca
    selectDevice(device) {
      this.selectedDevice = device;
      this.searchDevice = device.name; // Mantém o nome do dispositivo selecionado no campo de busca
      this.showDeviceList = false;     // Oculta a lista após a seleção
    },
    clearSearchDevice() {
      this.searchDevice = ''; // Limpa o campo de busca de dispositivo
      this.selectedDevice = null;
    }
  }
}
</script>

<style>
.Filter {
  z-index: 3;
  background-color: white;
  position: relative;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

h2, h3, p, li {
  color: black;
}

li {
  cursor: pointer;
  padding: 8px;
  background-color: #f0f0f0;
  margin-bottom: 2px;
}

li:hover {
  background-color: #d0d0d0;
}

input {
  padding: 8px;
  margin-bottom: 10px;
  width: 100%;
  box-sizing: border-box;
}
</style>
