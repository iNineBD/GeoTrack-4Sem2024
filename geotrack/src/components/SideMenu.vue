<template>
  <div class="side-menu">
    <ul class="menu-itens">
      <li>
        <a href="#">
          <img id="geotrack-image" src="/src/assets/images/geotracklogo.svg" alt="Geotrack icon" />
        </a>
      </li>
      <li>
        <a href="#" class="sidebar-link">
          <img id="home-image" src="/src/assets/images/home.svg" alt="home icon" />
        </a>
        <h6>Home</h6>
      </li>
      <li>
        <a href="#" class="sidebar-link">
          <img id="filter-image" src="/src/assets/images/filter.svg" alt="filter icon" />
        </a>
        <h6>Filtrar</h6>
      </li>
    </ul>
    <div id="logout">
      <a href="#" class="sidebar-link">
        <img id="logout-image" src="/src/assets/images/logout.svg" alt="logout icon" />
      </a>
      <h6>Logout</h6>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SideMenu'
}
</script>

<style scoped>
.side-menu {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
  color: black;
  background-color: rgb(255, 255, 255);
  font-size: 1rem;
  overflow: auto;
  max-height: 100vh;
  width: 8%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.192);
}

.menu-itens {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.menu-itens li {
  margin-bottom: 15px;
  text-align: center;
}

.sidebar-link {
  display: inline-block;
  padding: 0.5rem;
  border-radius: 5px;
  transition: background-color 0.4s ease;
}

h6 {
  margin: 0.5rem 0 0 0;
}


.sidebar-link:hover {
  outline: 3px solid rgba(0, 0, 255, 0.5);
  background-color: rgba(0, 0, 255, 0.5);
  border-radius: 5px;
}

.sidebar-link:hover img {
  filter: invert(1) brightness(2);
}

/* treatment of svg images to adapt their size and smaller differentiations */
#home-image, #filter-image, #logout-image{
  width: 3vh;
  height: auto;
  transition: filter 0.2s ease; 
}

#geotrack-image {
  width: 5vh;
  height: auto;
}


#logout {
  margin-top: auto;
  text-align: center;
  width: 100%;
  padding-bottom: 2rem;
}


</style>
