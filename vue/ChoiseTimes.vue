<template>
  <div class="container alert alert-primary mt-5">
    <p>Время на которое принимет специалист:</p>
    <div class="container alert alert-success" v-for="interval in getIntervals" :key="interval.id">
      <p>{{interval.date}}</p>
      <button type="submit" @click="signUpForConsultation(interval.id)" :value="interval.time">{{interval.time}}</button>
    </div>
  </div>
</template>



<script>
import {mapGetters} from "vuex";

export default {
  computed: {
    ...mapGetters([
      'showUser'
    ]),
  },

  props: ['id'],

  data() {
    return {
      idSpec: this.id,
      userId: null,
      getIntervals: null,
    }
  },

  mounted() {
    fetch("http://localhost:3000/get_info", {
      method: 'GET',
      cors: 'cors',
      headers: {
        'Authorization': this.showUser.token
      }
    })
    .then((res) => {
      if (res.status === 403){
        this.$router.push('/login');
      }
      if(res.status === 200) {
        return res.json()
      }
    })
    .then((res) => {
      if (res !== undefined) {
        this.userId = res.user.id
      }
    }).catch((e) =>{
      alert(e)
    });

    let id = this.idSpec

    fetch("http://localhost:3000/get_all_consult", {
      method: 'POST',
      credentials: 'same-origin',
      cors: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    })
    .then((res) => {
      if (res.status === 412) {
        alert(res)
      }
      if (res.status === 200) {
        return res.json()
      }
    })
    .then((res) => {
      if (res !== undefined) {
        this.getIntervals = res.times
      }
    }).catch((e) => {
      alert(e)
    });
  },

  methods: {
    signUpForConsultation(id) {
      let client_id = this.userId;
      let time_id = id;
      fetch("http://localhost:3000/set_consult", {
        method: 'POST',
        cors: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.showUser.token
        },
        body: JSON.stringify({client_id, time_id})
      })
      .then((res) => {
        if (res.status === 403){
          this.$router.push('/login');
        }
        if (res.status === 200) {
          return res.json()
        }
      })
      .then((res) => {
        if (res !== undefined) {
          alert("Вы отправили предложение консультанту на данное время!")
        }
          }).catch((e) => {
        alert(e)
      });
    }
  }
}
</script>



<style scoped>

</style>