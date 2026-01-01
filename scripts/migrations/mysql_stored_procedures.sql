-- MySQL Stored Procedures for E-Pesantren
-- Run this file after importing the database schema

DELIMITER $$

-- Procedure: InsertDebitFromBulan
-- Description: Insert debit records from bulan payments
CREATE DEFINER=`root`@`localhost` PROCEDURE `InsertDebitFromBulan`()
BEGIN
  INSERT INTO `debit` (
    `debit_date`, 
    `debit_desc`, 
    `debit_value`, 
    `user_user_id`, 
    `debit_input_date`, 
    `debit_last_update`,
    `account_id`, 
    `student_id`, 
    `recipient`, 
    `pos_id`, 
    `jurnal_id`, 
    `ppdb_nisn`, 
    `ppdb_participant_id`, 
    `created_by`
  )
  SELECT  
    `bulan_date_pay`,  
    'Pembayaran Siswa',  
    `bulan_bill`,  
    `user_user_id`,  
    `bulan_input_date`,  
    `bulan_last_update`,  
    NULL AS account_id,  
    `student_student_id`,  
    (SELECT user_full_name FROM users WHERE user_id = `user_user_id`) AS recipient,  
    (SELECT pos_id FROM pos WHERE jurnal_id = 3 AND pos_name LIKE CONCAT('%',(SELECT `name` FROM unit WHERE id = (SELECT unit_id FROM student WHERE student_id = `student_student_id`)))) AS pos_id,  
    `jurnal_id`,  
    NULL AS ppdb_nisn, 
    NULL AS ppdb_participant_id, 
    'query' AS created_by
  FROM `bulan`
  WHERE (`student_student_id`, `bulan_date_pay`) NOT IN (
    SELECT `student_id`, `debit_date`
    FROM `debit` 
    WHERE `student_id` IS NOT NULL AND `debit_date` IS NOT NULL
  ) 
  AND `bulan_date_pay` IS NOT NULL;
END$$

-- Procedure: UpdateParticipantIdPpdbBayar
-- Description: Update participant ID in ppdb_bayar table
CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateParticipantIdPpdbBayar`()
BEGIN
  UPDATE ppdb_bayar AS t
  JOIN ppdb_participant AS s ON t.nisn = s.nisn
  SET t.ppdb_participant_id = s.id
  WHERE t.nisn = s.nisn;
END$$

-- Procedure: update_bebas_total_pay
-- Description: Update total payment in bebas table
CREATE DEFINER=`root`@`localhost` PROCEDURE `update_bebas_total_pay`()
BEGIN
  UPDATE `bebas`
  JOIN (
    SELECT 
      b.`student_student_id`, 
      SUM(bp.`bebas_pay_bill`) AS total_bebas_pay_bill, 
      bp.`bebas_bebas_id`
    FROM `bebas` b
    JOIN `bebas_pay` bp ON b.`bebas_id` = bp.`bebas_bebas_id`
    WHERE bp.`jurnal_id` = 0
    GROUP BY b.`student_student_id`, bp.`bebas_bebas_id`
  ) AS subquery 
  ON `bebas`.`bebas_id` = subquery.`bebas_bebas_id`
  SET `bebas`.`bebas_total_pay` = subquery.`total_bebas_pay_bill`;
END$$

DELIMITER ;

-- Note: Change DEFINER if needed
-- Example: CREATE DEFINER=`your_user`@`localhost` PROCEDURE ...
