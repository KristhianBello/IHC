<template>
  <div class="register-card">
    <h1>Crear cuenta</h1>

    <form class="auth-form" @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="nombre">Nombre completo</label>
        <input
          type="text"
          id="nombre"
          v-model="nombre"
          placeholder="Tu nombre completo"
          required
        />
      </div>

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

      <div class="form-group">
        <label for="password">Contraseña</label>
        <input
          type="password"
          id="password"
          v-model="password"
          placeholder="••••••••"
          required
        />
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirmar contraseña</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          placeholder="••••••••"
          required
        />
      </div>

      <button type="submit" class="btn btn-primary btn-block">
        Registrarte
      </button>

      <div class="login-redirect">
        ¿Ya tienes una cuenta?
        <router-link to="/" class="link">Inicia sesión</router-link>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'RegisterForm',
  data() {
    return {
      nombre: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  },
  methods: {
    handleRegister() {
      if (!this.nombre || !this.email || !this.password || !this.confirmPassword) {
        alert('Por favor, completa todos los campos.')
        return
      }

      if (this.password !== this.confirmPassword) {
        alert('Las contraseñas no coinciden.')
        return
      }

      // Aquí podrías usar fetch o axios para hacer una petición POST a tu backend
      alert(`Registrado con: ${this.nombre}, ${this.email}`)
    },
  },
}
</script>


