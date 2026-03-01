package com.agriconnect.server.repository;

import com.agriconnect.server.entity.CommissionRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommissionRecordRepository extends JpaRepository<CommissionRecord, Long> {
}
