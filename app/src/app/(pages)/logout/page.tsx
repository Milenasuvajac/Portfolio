'use client'


import {logout} from "@/actions/logout";
import logger from "@/utils/logger";

const LogoutPage = () => {
  (async () => {
    try {
      await logout()
    } catch (error) {
      logger.error(error)
    }
  })()
  return (
    <div>
      <h1>Loging out...</h1>
    </div>
  )
}

export default LogoutPage
