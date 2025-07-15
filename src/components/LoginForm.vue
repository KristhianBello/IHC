<template>
  <div>
    <header class="header">
    ##logo pendiente##
      <div class="auth-buttons">
        <router-link to="/registro" class="btn btn-outline">Registrarte</router-link>
      </div>
    </header>

    <main class="auth-container" id="main-content">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Iniciar sesión</h1>
        </div>

        <form class="auth-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="tucorreo@ejemplo.com"
              required
            />
          </div>

          <div class="form-group password-group">
            <label for="password">Contraseña</label>
            <div class="password-input">
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                class="toggle-password"
                @click="togglePasswordVisibility"
                aria-label="Mostrar/Ocultar contraseña"
              >
                {{ showPassword ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block">
            Iniciar sesión
          </button>

          <div class="forgot-password-container">
            <router-link to="/forgot-password" class="forgot-password">
              ¿Olvidaste la contraseña?
            </router-link>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: "loginView",
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
    };
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    handleLogin() {
      // Aquí va la lógica para iniciar sesión. Puedes llamar a tu API, validar, etc.
      // Ejemplo simple:
      if (!this.email || !this.password) {
        alert("Por favor, completa todos los campos.");
        return;
      }
      // Aquí deberías hacer la petición al backend (usando fetch o axios)
      alert(`Inicio de sesión con: ${this.email} / ${this.password}`);
    },
  },
};
</script>

<style scoped>

</style>