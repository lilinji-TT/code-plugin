import axios from 'axios'
const API_URL =
  'http://s-gateway-qa.k8s.zhihuiya.com/s-ops-taco-backend/2023-07/code/improvement'

// Fetch data from the API
export const fetchData = async (requestData: any) => {
  try {
    const response = await axios.post(API_URL, requestData)
    return response
  } catch (error) {
    console.log(error)
    // Add a return statement here to handle the error case
    return null
  }
}
