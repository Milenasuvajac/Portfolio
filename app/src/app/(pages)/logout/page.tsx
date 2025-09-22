'use client'


import {logout} from "@/actions/logout";
import logger from "@/utils/logger";
import { useEffect } from "react";

const LogoutPage = () => {
  useEffect(() => {
    (async () => {
      try {
        await logout()
      } catch (error) {
        logger.error(error)
      }
    })()
  }, [])

  return (
    <div>
      <h1>Logging out...</h1>
    </div>
  )
}

export default LogoutPage
